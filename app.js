// Инициализация Telegram Web App
window.onerror = function(message, source, line, col, error) {
    console.log('GLOBAL ERROR:');
    console.log(message);
    console.log(source);
    console.log(line);
    console.log(error);
};

let tg = window.Telegram?.WebApp || {
    expand: () => {},
    enableClosingConfirmation: () => {},
    showAlert: (msg) => alert(msg),
    showConfirm: (msg, callback) => callback(confirm(msg)),
    BackButton: {
        show: () => {},
        hide: () => {},
        onClick: (callback) => {},
        offClick: (callback) => {}
    },
    MainButton: {
        show: () => {},
        hide: () => {},
        setText: (text) => {},
        onClick: (callback) => {},
        offClick: (callback) => {}
    }
};

if (window.Telegram?.WebApp) {
    tg.expand();
    tg.enableClosingConfirmation();
}

// Регистрация Service Worker для PWA
if ('serviceWorker' in navigator && !window.Telegram?.WebApp) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(() => console.log('Service Worker зарегистрирован'))
            .catch(err => console.log('Service Worker ошибка:', err));
    });
}

// ============================================
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ============================================

let currentDay = 'A';
let currentWorkoutData = {};
let customExercises = [];
let currentProgram = 'fullbody';
let userWorkoutProgram = null;
let userGlutesProgram = null;
let userFullBodyPlusProgram = null;
let editingExerciseIndex = null;
let currentWorkoutInProgress = null;
let autosaveTimeout = null;

const AI_PLANS_STORAGE_KEY = 'aiWorkoutPlans';
const API_WORKOUT_PLAN_URL = '/api/workout-plan';
const API_USER_STATE_URL = '/api/user-state';
const CLOUD_SYNC_META_KEY = 'cloudSyncMeta';
const SYNCED_STORAGE_KEYS = [
    'selectedWorkoutProgram',
    'userWorkoutProgram',
    'userGlutesProgram',
    'userFullBodyPlusProgram',
    'currentWorkoutInProgress',
    'workoutHistory',
    'customExercises',
    'aiTrainerData',
    'lastGeneratedAIPlan',
    AI_PLANS_STORAGE_KEY
];

let telegramUserId = null;
let telegramInitData = '';
let cloudSyncEnabled = false;
let cloudSyncReady = false;
let cloudSyncTimeout = null;
let cloudSyncInFlight = null;
let isApplyingRemoteState = false;

const STANDARD_PROGRAMS = {
    fullbody: {
        label: '💪 Full Body',
        storageKey: 'userWorkoutProgram',
        getDefaultProgram: () => workoutProgram
    },
    glutes: {
        label: '🍑 Ягодицы',
        storageKey: 'userGlutesProgram',
        getDefaultProgram: () => glutesProgram
    },
    fullbody_plus: {
        label: '⚙️ Full Body Plus',
        storageKey: 'userFullBodyPlusProgram',
        getDefaultProgram: () => fullBodyPlusProgram
    }
};

function readStorageJSON(key, fallback) {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;

    try {
        return JSON.parse(saved);
    } catch (error) {
        console.warn(`Не удалось прочитать ${key} из localStorage:`, error);
        removeStorageItem(key);
        return fallback;
    }
}

function isSyncedStorageKey(key) {
    return SYNCED_STORAGE_KEYS.includes(key);
}

function readCloudSyncMeta() {
    return readStorageJSON(CLOUD_SYNC_META_KEY, {
        lastLocalChangeAt: null,
        lastRemoteSyncAt: null
    });
}

function writeCloudSyncMeta(meta) {
    localStorage.setItem(CLOUD_SYNC_META_KEY, JSON.stringify(meta));
}

function markLocalStateChanged() {
    const meta = readCloudSyncMeta();
    meta.lastLocalChangeAt = new Date().toISOString();
    writeCloudSyncMeta(meta);
}

function setStorageItem(key, value) {
    localStorage.setItem(key, value);

    if (isSyncedStorageKey(key) && !isApplyingRemoteState) {
        markLocalStateChanged();
        scheduleCloudSync();
    }
}

function removeStorageItem(key) {
    localStorage.removeItem(key);

    if (isSyncedStorageKey(key) && !isApplyingRemoteState) {
        markLocalStateChanged();
        scheduleCloudSync();
    }
}

function collectCloudState() {
    const state = {};

    SYNCED_STORAGE_KEYS.forEach(key => {
        const rawValue = localStorage.getItem(key);
        if (rawValue === null) return;

        state[key] = rawValue;
    });

    return state;
}

function hasMeaningfulCloudState(state = collectCloudState()) {
    return Object.values(state).some(value => {
        if (value == null) return false;
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === 'object') return Object.keys(value).length > 0;
        return String(value).trim() !== '';
    });
}

function applyCloudState(state, updatedAt = new Date().toISOString()) {
    isApplyingRemoteState = true;

    try {
        SYNCED_STORAGE_KEYS.forEach(key => {
            if (Object.prototype.hasOwnProperty.call(state, key)) {
                localStorage.setItem(key, state[key]);
            } else {
                localStorage.removeItem(key);
            }
        });

        writeCloudSyncMeta({
            lastLocalChangeAt: updatedAt,
            lastRemoteSyncAt: updatedAt
        });
    } finally {
        isApplyingRemoteState = false;
    }
}

function getTelegramUserContext() {
    const safeUser = tg.initDataUnsafe?.user;
    const safeUserId = safeUser?.id;
    const initData = tg.initData || '';

    if (safeUserId && initData) {
        return {
            userId: String(safeUserId),
            initData
        };
    }

    if (!initData) return null;

    try {
        const userJson = new URLSearchParams(initData).get('user');
        if (!userJson) return null;

        const parsedUser = JSON.parse(userJson);
        if (!parsedUser?.id) return null;

        return {
            userId: String(parsedUser.id),
            initData
        };
    } catch (error) {
        console.warn('Не удалось определить Telegram user id для синхронизации:', error);
        return null;
    }
}

async function requestCloudState(state = null) {
    const response = await fetch(API_USER_STATE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            initData: telegramInitData,
            state
        })
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(result.error || `Cloud sync error: ${response.status}`);
    }

    return result;
}

async function persistCloudState(state = collectCloudState()) {
    if (!cloudSyncEnabled || !telegramInitData) return null;

    const request = (async () => {
        const result = await requestCloudState(state);
        const syncedAt = result.updatedAt || new Date().toISOString();

        writeCloudSyncMeta({
            lastLocalChangeAt: syncedAt,
            lastRemoteSyncAt: syncedAt
        });

        cloudSyncReady = true;
        return result;
    })();

    cloudSyncInFlight = request;

    try {
        return await request;
    } finally {
        if (cloudSyncInFlight === request) {
            cloudSyncInFlight = null;
        }
    }
}

function scheduleCloudSync() {
    if (!cloudSyncEnabled || isApplyingRemoteState) return;

    if (cloudSyncTimeout) {
        clearTimeout(cloudSyncTimeout);
    }

    cloudSyncTimeout = setTimeout(async () => {
        try {
            await persistCloudState();
        } catch (error) {
            console.error('Ошибка синхронизации с облаком:', error);
        }
    }, 800);
}

async function initializeCloudSync() {
    const telegramContext = getTelegramUserContext();
    if (!telegramContext) return;

    telegramUserId = telegramContext.userId;
    telegramInitData = telegramContext.initData;
    cloudSyncEnabled = true;

    const localState = collectCloudState();
    const localMeta = readCloudSyncMeta();

    try {
        const remoteState = await requestCloudState();

        if (remoteState?.state) {
            const localTimestamp = Date.parse(localMeta.lastLocalChangeAt || 0) || 0;
            const remoteTimestamp = Date.parse(remoteState.updatedAt || 0) || 0;

            if (localTimestamp > remoteTimestamp && hasMeaningfulCloudState(localState)) {
                await persistCloudState(localState);
            } else {
                applyCloudState(remoteState.state, remoteState.updatedAt);
                cloudSyncReady = true;
            }
        } else if (hasMeaningfulCloudState(localState)) {
            await persistCloudState(localState);
        } else {
            cloudSyncReady = true;
        }
    } catch (error) {
        console.error('Не удалось инициализировать облачную синхронизацию:', error);
    }
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================

async function init() {
    updateDate();
    await initializeCloudSync();
    loadCustomExercises();
    loadProgram();
    loadUserPrograms();
    loadCurrentWorkoutInProgress();
    showInstallPrompt();
    setupKeyboardHandlers();
    setupAutosaveHandlers();
}

function setupAutosaveHandlers() {
    const hasWorkoutData = () =>
        currentWorkoutData && Object.keys(currentWorkoutData).length > 0;

    window.addEventListener('beforeunload', () => {
        if (hasWorkoutData()) saveCurrentWorkoutInProgress();
    });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden && hasWorkoutData()) saveCurrentWorkoutInProgress();
    });

    // Автосохранение после потери фокуса на поле подхода
    document.addEventListener('focusout', (e) => {
        if (e.target.classList.contains('set-input') && hasWorkoutData()) {
            saveCurrentWorkoutInProgress();
            showSaveIndicator('saved');
        }
    });

    // Автосохранение каждые 30 сек при активном вводе
    setInterval(() => {
        if (document.activeElement?.classList.contains('set-input')) {
            saveCurrentWorkoutInProgress();
        }
    }, 30000);
}

// ============================================
// ПРОГРАММЫ И ХРАНИЛИЩЕ
// ============================================

function loadProgram() {
    const savedProgram = localStorage.getItem('selectedWorkoutProgram');
    if (savedProgram) {
        currentProgram = savedProgram;
    }
}

function loadUserPrograms() {
    userWorkoutProgram = readStorageJSON('userWorkoutProgram', null);
    userGlutesProgram = readStorageJSON('userGlutesProgram', null);
    userFullBodyPlusProgram = readStorageJSON('userFullBodyPlusProgram', null);
}

function getStoredProgram(programId) {
    if (programId === 'fullbody') return userWorkoutProgram;
    if (programId === 'glutes') return userGlutesProgram;
    if (programId === 'fullbody_plus') return userFullBodyPlusProgram;
    return null;
}

function setStoredProgram(programId, value) {
    if (programId === 'fullbody') userWorkoutProgram = value;
    if (programId === 'glutes') userGlutesProgram = value;
    if (programId === 'fullbody_plus') userFullBodyPlusProgram = value;
}

function getStandardProgramMeta(programId = currentProgram) {
    return STANDARD_PROGRAMS[programId] || null;
}

function getProgramDisplayName(programId = currentProgram) {
    const programMeta = getStandardProgramMeta(programId);
    return programMeta ? programMeta.label : '🤖 AI план';
}

function getAvailableProgramDays(programId = currentProgram) {
    let program = null;

    if (programId?.startsWith('ai_')) {
        program = userWorkoutProgram;
    } else {
        const programMeta = getStandardProgramMeta(programId);
        if (programMeta) {
            program = getStoredProgram(programId) || programMeta.getDefaultProgram();
        }
    }

    if (!program) return ['A', 'B', 'C'];

    return ['A', 'B', 'C', 'D'].filter(day => Boolean(program[day]));
}

function updateDayButtonsVisibility(programId = currentProgram) {
    const availableDays = new Set(getAvailableProgramDays(programId));

    document.querySelectorAll('[data-day]').forEach(button => {
        button.classList.toggle('hidden', !availableDays.has(button.dataset.day));
    });

    document.querySelectorAll('[data-edit-day]').forEach(button => {
        button.classList.toggle('hidden', !availableDays.has(button.dataset.editDay));
    });
}

function saveUserProgram() {
    const programMeta = getStandardProgramMeta();
    if (!programMeta) return;

    const program = getStoredProgram(currentProgram);
    if (program) setStorageItem(programMeta.storageKey, JSON.stringify(program));
}

function getCurrentProgram() {
    if (currentProgram?.startsWith('ai_')) return userWorkoutProgram;

    const programMeta = getStandardProgramMeta();
    if (!programMeta) return userWorkoutProgram || workoutProgram;

    return getStoredProgram(currentProgram) || programMeta.getDefaultProgram();
}

// Создать копию программы если пользователь ещё не редактировал её
function ensureUserProgram() {
    const programMeta = getStandardProgramMeta();
    if (!programMeta) return;

    if (!getStoredProgram(currentProgram)) {
        setStoredProgram(currentProgram, JSON.parse(JSON.stringify(programMeta.getDefaultProgram())));
    }
}

function resetToDefaultProgram() {
    if (!confirm('Вернуть план к стандартному? Все изменения будут удалены.')) return;

    const programMeta = getStandardProgramMeta();
    if (!programMeta) return;

    setStoredProgram(currentProgram, null);
    removeStorageItem(programMeta.storageKey);

    loadWorkout(currentDay);
    tg.showAlert('✅ План сброшен к стандартному');
}

// ============================================
// АВТОСОХРАНЕНИЕ
// ============================================

function loadCurrentWorkoutInProgress() {
    currentWorkoutInProgress = readStorageJSON('currentWorkoutInProgress', null);
    if (!currentWorkoutInProgress) return;

    const today = new Date().toISOString().split('T')[0];

    if (currentWorkoutInProgress.date === today) {
        currentWorkoutData = currentWorkoutInProgress.exercises || {};
        currentDay = currentWorkoutInProgress.day || 'A';
        currentProgram = currentWorkoutInProgress.program || 'fullbody';
    } else {
        clearCurrentWorkoutInProgress();
    }
}

function saveCurrentWorkoutInProgress() {
    const today = new Date().toISOString().split('T')[0];

    currentWorkoutInProgress = {
        date: today,
        day: currentDay,
        program: currentProgram,
        exercises: currentWorkoutData,
        timestamp: Date.now()
    };

    try {
        setStorageItem('currentWorkoutInProgress', JSON.stringify(currentWorkoutInProgress));
        showSaveIndicator('saved');
    } catch (e) {
        console.error('Ошибка сохранения:', e);
        showSaveIndicator('error');
    }
}

function debouncedSave() {
    if (autosaveTimeout) clearTimeout(autosaveTimeout);
    showSaveIndicator('saving');
    autosaveTimeout = setTimeout(() => saveCurrentWorkoutInProgress(), 500);
}

function clearCurrentWorkoutInProgress() {
    currentWorkoutInProgress = null;
    removeStorageItem('currentWorkoutInProgress');
}

function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    }[char]));
}

function normalizeExerciseName(name) {
    return String(name || '').trim().toLowerCase();
}

function formatSetResult(set) {
    const weight = String(set.weight || '').trim();
    const reps = String(set.reps || '').trim();

    if (weight && reps) return `${weight} кг x ${reps}`;
    if (reps) return `${reps} повт.`;
    if (weight) return `${weight} кг`;
    return '';
}

function formatLastExerciseResult(sets) {
    const completedSets = (sets || []).filter(set =>
        set && (String(set.weight || '').trim() || String(set.reps || '').trim())
    );

    if (completedSets.length === 0) return '';

    const weights = completedSets
        .map(set => String(set.weight || '').trim())
        .filter(Boolean);
    const firstWeight = weights[0];
    const hasSingleWeight = firstWeight && weights.length === completedSets.length &&
        weights.every(weight => weight === firstWeight);

    if (hasSingleWeight) {
        const reps = completedSets
            .map(set => String(set.reps || '').trim())
            .filter(Boolean)
            .join(', ');

        return reps ? `${firstWeight} кг x ${reps}` : `${firstWeight} кг`;
    }

    return completedSets
        .map(formatSetResult)
        .filter(Boolean)
        .join(', ');
}

function getLastExerciseResult(exercise) {
    const today = new Date().toISOString().split('T')[0];
    const history = readStorageJSON('workoutHistory', []);
    const exerciseName = normalizeExerciseName(exercise.name);

    for (const record of history) {
        if (record.dateOnly === today || !record.exercises) continue;

        const previousExercise = record.exercises[exercise.id] ||
            Object.values(record.exercises).find(item =>
                normalizeExerciseName(item?.name) === exerciseName
            );

        const result = formatLastExerciseResult(previousExercise?.sets);
        if (result) return result;
    }

    return '';
}

function showSaveIndicator(status) {
    let indicator = document.getElementById('saveIndicator');

    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'saveIndicator';
        indicator.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            padding: 8px 16px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 700;
            z-index: 999;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            opacity: 0;
            transform: translateY(-10px);
            pointer-events: none;
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
        `;
        document.body.appendChild(indicator);
    }

    const hide = () => {
        indicator.style.opacity = '0';
        indicator.style.transform = 'translateY(-10px)';
    };

    const show = () => {
        indicator.style.opacity = '1';
        indicator.style.transform = 'translateY(0)';
    };

    if (status === 'saving') {
        indicator.textContent = '💾 Сохранение...';
        indicator.style.background = 'rgba(167, 139, 250, 0.2)';
        indicator.style.border = '1px solid rgba(167, 139, 250, 0.4)';
        indicator.style.color = 'var(--primary)';
        show();
    } else if (status === 'saved') {
        indicator.textContent = '✓ Сохранено';
        indicator.style.background = 'rgba(16, 185, 129, 0.2)';
        indicator.style.border = '1px solid rgba(16, 185, 129, 0.4)';
        indicator.style.color = '#10b981';
        show();
        setTimeout(hide, 2000);
    } else if (status === 'restored') {
        indicator.textContent = '🔄 Тренировка восстановлена';
        indicator.style.background = 'rgba(167, 139, 250, 0.2)';
        indicator.style.border = '1px solid rgba(167, 139, 250, 0.4)';
        indicator.style.color = 'var(--primary)';
        show();
        setTimeout(hide, 3000);
    } else if (status === 'error') {
        indicator.textContent = '⚠️ Ошибка';
        indicator.style.background = 'rgba(239, 68, 68, 0.2)';
        indicator.style.border = '1px solid rgba(239, 68, 68, 0.4)';
        indicator.style.color = '#ef4444';
        show();
        setTimeout(hide, 3000);
    }
}

// ============================================
// НАВИГАЦИЯ
// ============================================

function switchPage(pageName) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));

    const pageMap = {
        'mainMenu':  'mainMenu',
        'workout':   'workoutPage',
        'history':   'historyPage',
        'progress':  'progressPage',
        'exercises': 'exercisesPage',
        'aiTrainer': 'aiTrainerPage',
        'myPlan':    'myPlanPage'
    };

    document.getElementById(pageMap[pageName]).classList.add('active');

    const fabBack = document.getElementById('fabBack');
    fabBack.classList.toggle('active', pageName !== 'mainMenu');

    if (pageName === 'workout')        loadWorkoutProgramSelection();
    else if (pageName === 'history')   loadHistory();
    else if (pageName === 'progress')  loadProgress();
    else if (pageName === 'exercises') loadExercisesGuide();
    else if (pageName === 'aiTrainer') loadAITrainerPage();
    else if (pageName === 'myPlan')    loadMyPlanPage();
}

function openWorkoutPage() {
    switchPage('workout');

    const savedProgram = localStorage.getItem('selectedWorkoutProgram');
    if (savedProgram) {
        selectWorkoutProgram(savedProgram);
    }
}

function updateDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = now.toLocaleDateString('ru-RU', options);
    document.getElementById('currentDate').textContent = dateStr;
    const workoutDateEl = document.getElementById('workoutDate');
    if (workoutDateEl) workoutDateEl.textContent = dateStr;
}

// ============================================
// КЛАВИАТУРА
// ============================================

function hideKeyboard() {
    if (document.activeElement?.matches('input, textarea')) {
        document.activeElement.blur();
    }
    document.getElementById('keyboardDoneBtn').classList.remove('active');
}

// Вызывается из HTML кнопки "Готово"
function hideKeyboardWithButton() {
    hideKeyboard();
}

function setupKeyboardHandlers() {
    document.addEventListener('focusin', (e) => {
        if (e.target.matches('input, textarea')) {
            document.getElementById('keyboardDoneBtn').classList.add('active');
        }
    });

    document.addEventListener('focusout', (e) => {
        if (e.target.matches('input, textarea')) {
            setTimeout(() => {
                if (!document.activeElement?.matches('input, textarea')) {
                    hideKeyboard();
                }
            }, 100);
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.matches('input, textarea')) {
            hideKeyboard();
        }
    });
}

// ============================================
// PWA
// ============================================

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallButton();
});

function showInstallButton() {
    if (window.Telegram?.WebApp) return;

    const installBtn = document.createElement('button');
    installBtn.id = 'installBtn';
    installBtn.className = 'btn-modern';
    installBtn.style.cssText = 'position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%); z-index: 1000; background: var(--primary); color: white; padding: 12px 24px; border-radius: 12px; font-weight: bold; box-shadow: var(--shadow-lg);';
    installBtn.textContent = '📱 Установить приложение';
    installBtn.onclick = installApp;
    document.body.appendChild(installBtn);
}

async function installApp() {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') console.log('Приложение установлено');

    deferredPrompt = null;
    document.getElementById('installBtn')?.remove();
}

function showInstallPrompt() {
    if (!window.Telegram?.WebApp && /iPhone|iPad|iPod/.test(navigator.userAgent) && !window.navigator.standalone) {
        if (!localStorage.getItem('pwaInstructionShown')) {
            setTimeout(() => {
                alert('💡 Совет: Добавьте приложение на домашний экран!\n\nНажмите кнопку "Поделиться" внизу Safari и выберите "На экран Домой"');
                localStorage.setItem('pwaInstructionShown', 'true');
            }, 2000);
        }
    }
}

// ============================================
// ВЫБОР ПРОГРАММЫ
// ============================================

function loadWorkoutProgramSelection() {
    document.getElementById('workoutProgramSelection').classList.remove('hidden');
    document.getElementById('workoutDaySelection').classList.add('hidden');

    const aiPlans = readStorageJSON(AI_PLANS_STORAGE_KEY, []);
    const aiProgramsList = document.getElementById('aiProgramsList');

    if (aiPlans.length > 0) {
        let html = '<div class="mt-4 pt-4" style="border-top: 2px dashed var(--border-color);"><p class="text-sm opacity-70 mb-3 text-center font-semibold">🤖 Мои AI Планы</p>';

        aiPlans.forEach(plan => {
            const date = new Date(plan.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
            html += `
                <div class="program-card w-full text-left flex items-center justify-between text-white mb-3" style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.8) 0%, rgba(236, 72, 153, 0.8) 100%);">
                    <div onclick="selectWorkoutProgram('${plan.id}')" class="flex items-center gap-4 flex-1 cursor-pointer">
                        <div class="text-4xl">🤖</div>
                        <div class="flex-1">
                            <div class="text-lg font-bold">${plan.name.replace('AI План - ', '')}</div>
                            <div class="text-sm opacity-90 mt-1">${plan.description}</div>
                            <div class="text-xs opacity-75 mt-1">Создан: ${date}</div>
                        </div>
                    </div>
                    <button onclick="event.stopPropagation(); deleteAIPlan('${plan.id}')" class="icon-btn text-2xl" title="Удалить">
                        🗑️
                    </button>
                </div>
            `;
        });

        html += '</div>';
        aiProgramsList.innerHTML = html;
    } else {
        aiProgramsList.innerHTML = '';
    }
}

function selectWorkoutProgram(programId) {
    setStorageItem('selectedWorkoutProgram', programId);

    if (getStandardProgramMeta(programId)) {
        currentProgram = programId;

        document.getElementById('workoutProgramSelection').classList.add('hidden');
        document.getElementById('workoutDaySelection').classList.remove('hidden');

        document.getElementById('currentProgramName').textContent = getProgramDisplayName(programId);

        updateDate();
        updateProgramButtons();
        updateDayButtonsVisibility(programId);

        const today = new Date().toISOString().split('T')[0];
        if (
            currentWorkoutInProgress &&
            currentWorkoutInProgress.date === today &&
            currentWorkoutInProgress.program === programId
        ) {
            selectDay(currentWorkoutInProgress.day);
            setTimeout(() => showSaveIndicator('restored'), 500);
        } else {
            selectDay('A');
        }
    } else {
        loadAIPlanAsProgram(programId);
    }
}

function loadAIPlanAsProgram(planId) {
    const aiPlans = readStorageJSON(AI_PLANS_STORAGE_KEY, []);
    const plan = aiPlans.find(p => p.id === planId);

    if (!plan) {
        tg.showAlert('⚠️ План не найден');
        return;
    }

    currentProgram = planId;
    userWorkoutProgram = plan.program;

    document.getElementById('workoutProgramSelection').classList.add('hidden');
    document.getElementById('workoutDaySelection').classList.remove('hidden');
    document.getElementById('currentProgramName').textContent = `🤖 ${plan.name.replace('AI План - ', '')}`;

    updateDate();
    updateDayButtonsVisibility(planId);
    selectDay('A');
}

function deleteAIPlan(planId) {
    let aiPlans = readStorageJSON(AI_PLANS_STORAGE_KEY, []);
    aiPlans = aiPlans.filter(p => p.id !== planId);
    setStorageItem(AI_PLANS_STORAGE_KEY, JSON.stringify(aiPlans));
    loadWorkoutProgramSelection();
    tg.showAlert('✅ План удалён');
}

function backToProgramSelection() {
    document.getElementById('workoutProgramSelection').classList.remove('hidden');
    document.getElementById('workoutDaySelection').classList.add('hidden');
}

function updateProgramButtons() {
    document.querySelectorAll('[data-program-card]').forEach(card => {
        card.classList.toggle('active', card.dataset.programCard === currentProgram);
    });
}

// ============================================
// ТРЕНИРОВКА
// ============================================

function selectDay(day) {
    currentDay = day;

    document.querySelectorAll('.day-btn[data-day]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.day === day);
    });

    loadWorkout(day);
}

function loadWorkout(day) {
    if (
        typeof workoutProgram === 'undefined' ||
        typeof glutesProgram === 'undefined' ||
        typeof fullBodyPlusProgram === 'undefined'
    ) {
        console.error('Программы тренировок не загружены!');
        document.getElementById('exercisesList').innerHTML =
            '<div class="card-modern text-center p-4"><p class="text-red-500">Ошибка загрузки программ. Обнови страницу.</p></div>';
        return;
    }

    const program = getCurrentProgram();
    const workout = program[day];

    if (!workout) {
        console.error('День тренировки не найден:', day, 'в программе:', currentProgram);
        return;
    }

    const container = document.getElementById('exercisesList');

    const today = new Date().toISOString().split('T')[0];
    if (
        currentWorkoutInProgress &&
        currentWorkoutInProgress.date === today &&
        currentWorkoutInProgress.day === day &&
        currentWorkoutInProgress.program === currentProgram
    ) {
        currentWorkoutData = currentWorkoutInProgress.exercises;
    } else {
        currentWorkoutData = {};
    }

    let html = '';

    workout.exercises.forEach((exercise, index) => {
        if (!currentWorkoutData[exercise.id]) {
            currentWorkoutData[exercise.id] = { name: exercise.name, sets: [] };
        }

        const lastResult = getLastExerciseResult(exercise);
        const details = `
            <span class="exercise-meta-chip exercise-meta-plan">${escapeHTML(`${exercise.sets} × ${exercise.reps}`)}</span>
            ${lastResult ? `<span class="exercise-meta-chip exercise-meta-last">Прошлый раз: ${escapeHTML(lastResult)}</span>` : ''}
        `;

        html += `
            <details class="exercise-item" data-exercise-id="${exercise.id}">
                <summary class="cursor-pointer flex justify-between items-center">
                    <div class="flex-1 pr-3">
                        <h3 class="exercise-name">${exercise.emoji} ${exercise.name}</h3>
                        <p class="exercise-details">${details}</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="event.stopPropagation(); deleteExercise(${index})" class="icon-btn">🗑️</button>
                        <span class="text-lg arrow opacity-60">↴</span>
                    </div>
                </summary>

                <div class="mt-4 pt-4" style="border-top: 1px solid var(--border-color);">
                    <div class="mb-4">
					 ${exercise.muscleGroups ? `
        <div class="text-sm mb-3 opacity-70">
            🎯 ${exercise.muscleGroups}
        </div>
    ` : ''}
                        <p class="text-sm opacity-80 mb-3 leading-relaxed">${exercise.technique}</p>
                        ${exercise.youtubeUrl ? `<a href="${exercise.youtubeUrl}" target="_blank" class="youtube-link">▶️ Смотреть технику</a>` : ''}
                    </div>

                    <div class="space-y-3">
        `;

        for (let i = 0; i < exercise.sets; i++) {
            const savedSet = currentWorkoutData[exercise.id].sets[i] || {};
            html += `
                <div class="grid grid-cols-3 gap-3 items-center">
                    <div class="flex items-center">
                        <span class="text-sm font-semibold opacity-70">Подход ${i + 1}</span>
                    </div>
                    <input
                        type="number"
                        placeholder="Вес"
                        inputmode="decimal"
                        value="${savedSet.weight || ''}"
                        class="set-input"
                        onchange="updateSet('${exercise.id}', ${i}, 'weight', this.value)"
                    >
                    <input
                        type="number"
                        placeholder="Повт"
                        inputmode="numeric"
                        value="${savedSet.reps || ''}"
                        class="set-input"
                        onchange="updateSet('${exercise.id}', ${i}, 'reps', this.value)"
                    >
                </div>
            `;
        }

        html += `
                    </div>
                    <div class="flex gap-2 mt-4">
                        <button onclick="event.stopPropagation(); event.preventDefault(); addSetToExercise(${index})" class="add-set-btn flex-1 text-sm py-3">
                            ➕ Подход
                        </button>
                        <button onclick="event.stopPropagation(); saveCurrentWorkoutInProgress()" class="save-btn flex-1 text-sm py-3">
                            💾 Сохранить
                        </button>
                    </div>
                </div>
            </details>
        `;
    });

    container.innerHTML = html;
    saveCurrentWorkoutInProgress();
}

function updateSet(exerciseId, setIndex, field, value) {
    if (!currentWorkoutData[exerciseId].sets[setIndex]) {
        currentWorkoutData[exerciseId].sets[setIndex] = {};
    }
    currentWorkoutData[exerciseId].sets[setIndex][field] = value;
    debouncedSave();
}

function addSetToExercise(exerciseIndex) {
    ensureUserProgram();

    const program = getCurrentProgram();
    const exercise = program[currentDay].exercises[exerciseIndex];
    exercise.sets += 1;

    saveUserProgram();

    const openExerciseId = exercise.id;
    loadWorkout(currentDay);

    setTimeout(() => {
        const detailsElement = document.querySelector(`details[data-exercise-id="${openExerciseId}"]`);
        if (detailsElement) detailsElement.open = true;
    }, 10);

    tg.showAlert('✅ Подход добавлен!');
}

function completeWorkout() {
    let hasData = false;
    for (let exerciseId in currentWorkoutData) {
        const exercise = currentWorkoutData[exerciseId];
        if (exercise.sets?.length > 0) {
            const validSets = exercise.sets.filter(set => set && (set.weight || set.reps));
            if (validSets.length > 0) { hasData = true; break; }
        }
    }

    if (!hasData) {
        tg.showAlert('⚠️ Заполните хотя бы одно упражнение!');
        return;
    }

    const program = getCurrentProgram();
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    const workoutRecord = {
        date: now.toISOString(),
        dateOnly: today,
        dateFormatted: now.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        day: currentDay,
        dayName: program[currentDay].name,
        program: currentProgram,
        exercises: JSON.parse(JSON.stringify(currentWorkoutData))
    };

    let history = readStorageJSON('workoutHistory', []);
    const existingIndex = history.findIndex(record => record.dateOnly === today);

    if (existingIndex !== -1) {
    const existing = history[existingIndex];

    for (let exerciseId in workoutRecord.exercises) {

        // Если упражнения ещё нет → просто добавить
        if (!existing.exercises[exerciseId]) {
            existing.exercises[exerciseId] = workoutRecord.exercises[exerciseId];
            continue;
        }

        // Если упражнение уже есть → объединяем подходы
        const oldSets = existing.exercises[exerciseId].sets || [];
        const newSets = workoutRecord.exercises[exerciseId].sets || [];

        // Добавляем только новые подходы
        existing.exercises[exerciseId].sets = [
            ...oldSets,
            ...newSets
        ];
    }

    existing.date = workoutRecord.date;
    existing.dateFormatted = workoutRecord.dateFormatted;

    history[existingIndex] = existing;
} else {
        history.unshift(workoutRecord);
    }

    setStorageItem('workoutHistory', JSON.stringify(history));

    clearCurrentWorkoutInProgress();
    currentWorkoutData = {};

    tg.showAlert('✅ Тренировка сохранена!', () => switchPage('mainMenu'));
}

// ============================================
// РЕДАКТИРОВАНИЕ УПРАЖНЕНИЙ
// ============================================

function editExercise(index) {
    const program = getCurrentProgram();
    const exercise = program[currentDay].exercises[index];
    editingExerciseIndex = index;

    document.getElementById('editExerciseName').value = exercise.name;
    document.getElementById('editExerciseSets').value = exercise.sets;
    document.getElementById('editExerciseReps').value = exercise.reps;
    document.getElementById('editExerciseModal').classList.add('active');
}

function closeEditExerciseModal() {
    document.getElementById('editExerciseModal').classList.remove('active');
    editingExerciseIndex = null;
}

function saveExerciseEdit() {
    if (editingExerciseIndex === null) return;

    const name = document.getElementById('editExerciseName').value.trim();
    const sets = parseInt(document.getElementById('editExerciseSets').value);
    const reps = document.getElementById('editExerciseReps').value.trim();

    if (!name || !sets || !reps) {
        alert('Заполните все поля');
        return;
    }

    ensureUserProgram();

    const program = getCurrentProgram();
    const exercise = program[currentDay].exercises[editingExerciseIndex];
    exercise.name = name;
    exercise.sets = sets;
    exercise.reps = reps;

    saveUserProgram();
    closeEditExerciseModal();
    loadWorkout(currentDay);
    updateAfterEdit();

    tg.showAlert('✅ Изменения сохранены!');
}

function deleteExercise(index) {
    if (!confirm('Удалить это упражнение?')) return;

    ensureUserProgram();

    const program = getCurrentProgram();
    program[currentDay].exercises.splice(index, 1);

    saveUserProgram();
    loadWorkout(currentDay);
    updateAfterEdit();

    tg.showAlert('✅ Упражнение удалено!');
}

function moveExerciseUp(index) {
    if (index === 0) return;

    ensureUserProgram();

    const exercises = getCurrentProgram()[currentDay].exercises;
    [exercises[index], exercises[index - 1]] = [exercises[index - 1], exercises[index]];

    saveUserProgram();
    loadWorkout(currentDay);
    updateAfterEdit();
}

function moveExerciseDown(index) {
    const exercises = getCurrentProgram()[currentDay].exercises;
    if (index === exercises.length - 1) return;

    ensureUserProgram();
    [exercises[index], exercises[index + 1]] = [exercises[index + 1], exercises[index]];

    saveUserProgram();
    loadWorkout(currentDay);
    updateAfterEdit();
}

function updateAfterEdit() {
    const myPlanPage = document.getElementById('myPlanPage');
    if (myPlanPage?.classList.contains('active')) {
        loadEditExercisesList(currentDay);
    }
}

// ============================================
// МОЙ ПЛАН (РЕЖИМ РЕДАКТИРОВАНИЯ)
// ============================================

function loadMyPlanPage() {
    if (!getStandardProgramMeta(currentProgram)) {
        currentProgram = 'fullbody';
    }

    updateProgramButtonsForEdit();
    updateDayButtonsVisibility();
    selectDayForEdit('A');
}

function switchProgramForEdit(program) {
    currentProgram = program;
    updateProgramButtonsForEdit();
    updateDayButtonsVisibility(program);
    selectDayForEdit('A');
}

function updateProgramButtonsForEdit() {
    document.querySelectorAll('[data-edit-program]').forEach(button => {
        button.classList.toggle('active', button.dataset.editProgram === currentProgram);
    });
}

function selectDayForEdit(day) {
    currentDay = day;

    document.querySelectorAll('[data-edit-day]').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-edit-day="${day}"]`).classList.add('active');

    loadEditExercisesList(day);
}

function loadEditExercisesList(day) {
    const program = getCurrentProgram();
    const workout = program[day];
    const container = document.getElementById('editExercisesList');

    let html = `
        <div class="card-modern mb-4">
            <h3 class="text-lg font-bold mb-3" style="background: var(--primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                ${workout.emoji} ${workout.name}
            </h3>
            <button onclick="showAddExerciseFromGuideModal()" class="btn-modern w-full">
                ➕ Добавить упражнение
            </button>
        </div>
    `;

    workout.exercises.forEach((exercise, index) => {
        html += `
            <div class="card-modern mb-3">
                <div class="flex items-center gap-3 mb-3">
                    <span class="text-2xl">${exercise.emoji}</span>
                    <div class="flex-1">
                        <div class="font-bold">${exercise.name}</div>
                        <div class="text-sm opacity-70">${exercise.sets} × ${exercise.reps}</div>
                    </div>
                </div>
                <div class="grid grid-cols-4 gap-2">
                    <button onclick="event.stopPropagation(); moveExerciseUp(${index})" class="py-2 rounded-lg font-semibold text-sm" style="background: rgba(255,255,255,0.05)" ${index === 0 ? 'style="opacity: 0.3; pointer-events: none;"' : ''}>
                        ⬆️
                    </button>
                    <button onclick="event.stopPropagation(); moveExerciseDown(${index})" class="py-2 rounded-lg font-semibold text-sm" style="background: rgba(255,255,255,0.05)" ${index === workout.exercises.length - 1 ? 'style="opacity: 0.3; pointer-events: none;"' : ''}>
                        ⬇️
                    </button>
                    <button onclick="event.stopPropagation(); editExercise(${index})" class="py-2 rounded-lg font-semibold text-sm" style="background: rgba(255,255,255,0.05)">
                        ✏️
                    </button>
                    <button onclick="event.stopPropagation(); deleteExercise(${index})" class="py-2 rounded-lg font-semibold text-sm" style="background: var(--danger-bg); border: 1px solid var(--danger); color: var(--danger);">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// ============================================
// СПРАВОЧНИК УПРАЖНЕНИЙ
// ============================================

function showAddExerciseFromGuideModal() {
    loadAllExercises();
}

function closeAddExerciseFromGuideModal() {
    document.getElementById('addExerciseFromGuideModal').classList.remove('active');
}

function loadAllExercises() {
    const container = document.getElementById('guideExercisesList')
    const categories = {};

    allExercises.forEach(exercise => {
        if (!categories[exercise.category]) categories[exercise.category] = [];
        categories[exercise.category].push(exercise);
    });

    let html = '';

    Object.keys(categories).forEach(category => {
        html += `<div class="mb-4"><h4 class="text-sm font-bold opacity-70 mb-3">${category}</h4>`;

        categories[category].forEach(exercise => {
            html += `
                <div onclick="addExerciseFromGuide('${exercise.name}', '${exercise.emoji}', '${exercise.youtubeUrl}')"
                     class="card-modern p-4 mb-2 cursor-pointer hover:bg-white hover:bg-opacity-10 transition-all">
                    <div class="flex items-center gap-3">
                        <span class="text-3xl">${exercise.emoji}</span>
                        <div class="flex-1">
                            <div class="font-semibold text-base">${exercise.name}</div>
                            ${exercise.muscleGroups ? `<div class="text-sm opacity-70 mt-1">${exercise.muscleGroups}</div>` : ''}
                        </div>
                    </div>
                </div>
            `;
        });

        html += '</div>';
    });

    container.innerHTML = html;
}

function addExerciseFromGuide(name, emoji, youtubeUrl) {
    ensureUserProgram();

    const exerciseFromGuide = allExercises.find(ex => ex.name === name);
    const program = getCurrentProgram();

    const newExercise = {
        id: 'guide_' + Date.now(),
        name,
        emoji,
        sets: 4,
        reps: '12',
        technique: '',
        youtubeUrl,
        muscleGroups: exerciseFromGuide?.muscleGroups || ''
    };

    program[currentDay].exercises.push(newExercise);
    saveUserProgram();
    document.getElementById('exercisesList').innerHTML = '';
    loadWorkout(currentDay);
    tg.showAlert('✅ Упражнение добавлено!');
}

function showAddCustomExerciseModal() {
    document.getElementById('addCustomExerciseModal').classList.add('active');
}

function closeAddCustomExerciseModal() {
    document.getElementById('addCustomExerciseModal').classList.remove('active');
    document.getElementById('customExerciseName').value = '';
    document.getElementById('customExerciseSets').value = '';
    document.getElementById('customExerciseReps').value = '';
}

function addCustomExercise() {
    const name = document.getElementById('customExerciseName').value.trim();
    if (!name) {
        alert('Введите название упражнения');
        return;
    }

    const setsInput = document.getElementById('customExerciseSets').value.trim();
    const repsInput = document.getElementById('customExerciseReps').value.trim();
    const sets = setsInput ? parseInt(setsInput) : 4;
    const reps = repsInput || '12';

    ensureUserProgram();

    const program = getCurrentProgram();
    const newExercise = {
        id: 'custom_' + Date.now(),
        name,
        emoji: '✏️',
        sets,
        reps,
        technique: '',
        youtubeUrl: ''
    };

    program[currentDay].exercises.push(newExercise);
    saveUserProgram();
    closeAddCustomExerciseModal();
    loadWorkout(currentDay);
    tg.showAlert('✅ Упражнение добавлено!');
}

function loadCustomExercises() {
    customExercises = readStorageJSON('customExercises', []);
}

function saveCustomExercises() {
    setStorageItem('customExercises', JSON.stringify(customExercises));
}

// ============================================
// КАЛЬКУЛЯТОР 1RM
// ============================================

function calculateBenchRM() {
    const weight = parseFloat(document.getElementById('benchWeight').value);
    const reps = parseInt(document.getElementById('benchReps').value);
    const resultEl = document.getElementById('rmResult');

    if (!Number.isFinite(weight) || !Number.isFinite(reps) || weight <= 0 || reps < 1 || reps > 30) {
        resultEl.classList.remove('hidden');
        resultEl.textContent = 'Введите корректные данные';
        return;
    }

    const epley    = weight * (1 + reps / 30);
    const brzycki  = weight * (36 / (37 - reps));
    const lander   = (100 * weight) / (101.3 - 2.67123 * reps);
    const lombardi = weight * Math.pow(reps, 0.10);
    const mayhew   = (100 * weight) / (52.2 + 41.9 * Math.exp(-0.055 * reps));
    const oconnor  = weight * (1 + 0.025 * reps);
    const watanabe = (100 * weight) / (48.8 + 53.8 * Math.exp(-0.075 * reps));

    const average = (epley + brzycki + lander + lombardi + mayhew + oconnor + watanabe) / 7;
    const finalResult = Math.round(average);

    resultEl.classList.remove('hidden');
    resultEl.replaceChildren(
        document.createTextNode(`${finalResult} кг`),
        Object.assign(document.createElement('small'), {
            textContent: 'Примерный 1RM на основе 7 формул'
        })
    );
}

// ============================================
// ИСТОРИЯ
// ============================================

function loadHistory() {
    const history = readStorageJSON('workoutHistory', []);
    const container = document.getElementById('historyContent');

    if (history.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12 opacity-50">
                <div class="text-4xl mb-2">📝</div>
                <p>История тренировок пуста</p>
                <p class="text-sm mt-1">Завершите первую тренировку!</p>
            </div>
        `;
        return;
    }

    let html = '';

    history.forEach((record, recordIndex) => {
        const dateStr = new Date(record.date).toLocaleDateString('ru-RU', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });

        html += `
            <details class="card-modern mb-4">
                <summary class="cursor-pointer flex justify-between items-center">
                    <div>
                        <div class="flex items-center gap-2 mb-1">
                            <span class="chip">
                                ${escapeHTML(getProgramDisplayName(record.program))}
                            </span>
                        </div>
                        <h3 class="text-lg font-bold">${record.dayName}</h3>
                        <p class="text-sm opacity-70 mt-1">📅 ${record.dateFormatted}</p>
                    </div>
                    <div class="flex items-center gap-3">

    <button
        onclick="event.stopPropagation(); editHistoryWorkout(${recordIndex})"
        class="text-xl opacity-70 hover:opacity-100"
    >
        ✏️
    </button>

    <button
        onclick="event.stopPropagation(); deleteHistoryWorkout(${recordIndex})"
        class="text-xl opacity-70 hover:opacity-100 text-red-400"
    >
        🗑
    </button>

    <span class="text-xl arrow">▼</span>

</div>
                </summary>
                <div class="mt-4 pt-4 border-t border-white border-opacity-10 space-y-3">
        `;

        for (let exerciseId in record.exercises) {
            const exercise = record.exercises[exerciseId];
            if (exercise.sets?.length > 0) {
                const validSets = exercise.sets.filter(set => set && (set.weight || set.reps));
                if (validSets.length > 0) {
                    html += `
                        <div class="bg-white bg-opacity-5 rounded-xl p-3">
                            <div class="font-semibold text-base mb-2">${exercise.name}</div>
                            <div class="grid grid-cols-2 gap-2 text-sm">
                    `;

                    validSets.forEach((set, setIndex) => {
                        if (set.weight || set.reps) {
                            html += `
                                <div class="flex items-center gap-2 opacity-80">
                                    <span class="text-xs opacity-60">Подход ${setIndex + 1}:</span>
                                    <span class="font-semibold">${set.weight || '—'} кг × ${set.reps || '—'}</span>
                                </div>
                            `;
                        }
                    });

                    html += `</div></div>`;
                }
            }
        }

        html += `</div></details>`;
    });

    container.innerHTML = html;
}

function deleteHistoryWorkout(recordIndex) {

    if (!confirm('Удалить всю тренировку?')) {
        return;
    }

    let history = readStorageJSON('workoutHistory', []);

    history.splice(recordIndex, 1);

    setStorageItem(
        'workoutHistory',
        JSON.stringify(history)
    );

    loadHistory();
    loadProgress();

    tg.showAlert('🗑 Тренировка удалена');
}

function editHistoryWorkout(recordIndex) {
    const history = readStorageJSON('workoutHistory', []);
    const record = history[recordIndex];
    if (!record) return;

    document.getElementById('editHistoryModal').classList.add('active');
    document.getElementById('editHistoryIndex').value = recordIndex;

    const container = document.getElementById('editHistoryExercises');
    let html = `<h3 class="text-lg font-bold mb-3">${record.dayName}</h3>`;

    for (let exerciseId in record.exercises) {
        const exercise = record.exercises[exerciseId];
        if (exercise.sets?.length > 0) {
            html += `
                 <div class="card-modern mb-3">

        <div class="flex justify-between items-center mb-2">

            <div class="font-semibold">
                ${exercise.name}
            </div>

            <button
                onclick="deleteExerciseFromHistory(${recordIndex}, '${exerciseId}')"
                class="text-red-400 opacity-70 hover:opacity-100 text-sm"
            >
                🗑
            </button>

        </div>

        <div class="space-y-2">
`;

            exercise.sets.forEach((set, setIndex) => {
                if (set && (set.weight || set.reps)) {
                    html += `
                        <div class="grid grid-cols-3 gap-2">
                            <span class="text-sm opacity-70 flex items-center">Подход ${setIndex + 1}</span>
                            <input type="number" value="${set.weight || ''}" placeholder="Вес"
                                   class="input-modern text-sm"
                                   data-exercise="${exerciseId}" data-set="${setIndex}" data-field="weight">
                            <input type="number" value="${set.reps || ''}" placeholder="Повт"
                                   class="input-modern text-sm"
                                   data-exercise="${exerciseId}" data-set="${setIndex}" data-field="reps">
                        </div>
                    `;
                }
            });

            html += `</div></div>`;
        }
    }

    container.innerHTML = html;
}

function deleteExerciseFromHistory(recordIndex, exerciseId) {

    if (!confirm('Удалить упражнение из истории?')) {
        return;
    }

    let history = readStorageJSON('workoutHistory', []);

    if (!history[recordIndex]) return;

    delete history[recordIndex].exercises[exerciseId];

    // Если упражнений не осталось — удалить тренировку полностью
    if (
        Object.keys(history[recordIndex].exercises).length === 0
    ) {
        history.splice(recordIndex, 1);

        closeEditHistoryModal();
    }

    setStorageItem(
        'workoutHistory',
        JSON.stringify(history)
    );

    loadHistory();
    loadProgress();

    tg.showAlert('🗑 Упражнение удалено');
}

function saveHistoryEdit() {
    const recordIndex = parseInt(document.getElementById('editHistoryIndex').value);
    const history = readStorageJSON('workoutHistory', []);
    const record = history[recordIndex];
    if (!record) return;

    document.querySelectorAll('#editHistoryExercises input').forEach(input => {
        const exerciseId = input.dataset.exercise;
        const setIndex = parseInt(input.dataset.set);
        const field = input.dataset.field;
        if (record.exercises[exerciseId]?.sets[setIndex]) {
            record.exercises[exerciseId].sets[setIndex][field] = input.value;
        }
    });

    history[recordIndex] = record;
    setStorageItem('workoutHistory', JSON.stringify(history));

    closeEditHistoryModal();
    loadHistory();
    tg.showAlert('✅ Изменения сохранены!');
}

function closeEditHistoryModal() {
    document.getElementById('editHistoryModal').classList.remove('active');
}

// ============================================
// ПРОГРЕСС
// ============================================

function loadProgress() {

    const history = readStorageJSON('workoutHistory', []);

    let totalWorkouts = 0;

history.forEach(record => {
    for (let exerciseId in record.exercises) {
        const exercise = record.exercises[exerciseId];

        if (exercise.sets?.some(set => set && (set.weight || set.reps))) {
            totalWorkouts++;
            break;
        }
    }
});

const totalWorkoutsEl = document.getElementById('totalWorkouts');

totalWorkoutsEl.textContent = history.length;
totalWorkoutsEl.style.color = '#ffffff';
totalWorkoutsEl.style.fontSize = '34px';
totalWorkoutsEl.style.fontWeight = '700';

    // ===== STREAK =====

    let streak = 0;

    if (history.length > 0) {

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < history.length; i++) {

            const workoutDate = new Date(history[i].date);

            workoutDate.setHours(0, 0, 0, 0);

            const diffDays = Math.floor(
                (today - workoutDate) /
                (1000 * 60 * 60 * 24)
            );

            if (diffDays === i) {
                streak++;
            } else {
                break;
            }
        }
    }

    document.getElementById('currentStreak').textContent =
        streak;

    // ЗАГРУЗКА ВСЕХ РЕКОРДОВ
    loadProgressExercises();
	
}

function renderProgressChart() {
	
	const existingChart =
    Chart.getChart('exerciseProgressChart');

if (existingChart) {
    existingChart.destroy();
}

    const history = JSON.parse(localStorage.getItem('workoutHistory') || '[]');

    const exerciseData = {};

    history.forEach(record => {

    if (!record.exercises) return;

    for (let exerciseId in record.exercises) {

            const exercise = record.exercises[exerciseId];

            if (!exercise?.sets) continue;

            const validSets = exercise.sets.filter(
                set => set && set.weight && parseFloat(set.weight) > 0
            );

            if (validSets.length === 0) continue;

            const maxWeight = Math.max(
                ...validSets.map(set => parseFloat(set.weight))
            );

            const name = exercise.name;

            if (!exerciseData[name]) {
                exerciseData[name] = [];
            }

            exerciseData[name].push({
                date: new Date(record.date),
                weight: maxWeight
            });
        }

    });

    // Берем только топ-1 упражнение по количеству записей

const select =
    document.getElementById('chartExerciseSelect');

let exerciseName;

if (select && select.value) {

    exerciseName = select.value;

} else {

    // если select нет — берем первое упражнение
    exerciseName = Object.keys(exerciseData)[0];
	if (!exerciseName) return;

}

const records = exerciseData[exerciseName];
if (!records) return;

if (!records || records.length === 0) return;

    records.sort((a, b) => a.date - b.date);

    const labels = records.map(r =>
        r.date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit'
        })
    );

    const data = records.map(r => r.weight);

    const canvas =
    document.getElementById('exerciseProgressChart');

if (!canvas) return;

const ctx = canvas.getContext('2d');

    new Chart(ctx, {

        type: 'line',

        data: {

            labels,

            datasets: [{
                label: exerciseName,
                data,

                borderColor: '#8b5cf6',

                backgroundColor: 'rgba(139,92,246,0.15)',

                tension: 0.35,

                fill: true,

                pointRadius: 4,

                pointHoverRadius: 6
            }]
        },

        options: {

            responsive: true,

            plugins: {

                legend: {
                    display: false
                }
            },

            scales: {

                x: {

                    ticks: {
                        color: 'rgba(255,255,255,0.5)'
                    },

                    grid: {
                        display: false
                    }
                },

                y: {

                    ticks: {
                        color: 'rgba(255,255,255,0.5)'
                    },

                    grid: {
                        color: 'rgba(255,255,255,0.05)'
                    }
                }
            }
        }
    });
	
}

function loadProgressExercises() {

    const history = JSON.parse(localStorage.getItem('workoutHistory') || '[]');

    const container = document.getElementById('progressExercisesList');

    if (history.length === 0) {

        container.innerHTML = `
            <div class="text-center py-8 opacity-50">
                <div class="text-3xl mb-2">📈</div>
                <p>Нет данных прогресса</p>
            </div>
        `;

        return;
    }

    const exerciseStats = {};

    history.forEach(record => {

    if (!record.exercises) return;

    for (let exerciseId in record.exercises) {

            const exercise = record.exercises[exerciseId];

            if (!exercise || !exercise.sets) continue;

            const validSets = exercise.sets.filter(
                set => set && set.weight && parseFloat(set.weight) > 0
            );

            if (validSets.length === 0) continue;

            const maxWeight = Math.max(
                ...validSets.map(set => parseFloat(set.weight) || 0)
            );

            const exerciseName = exercise.name;

            if (!exerciseStats[exerciseName]) {

                exerciseStats[exerciseName] = {
                    name: exerciseName,
                    records: [],
                    max: 0
                };

            }

            exerciseStats[exerciseName].records.push({
                date: record.date,
                weight: maxWeight
            });

            if (maxWeight > exerciseStats[exerciseName].max) {
                exerciseStats[exerciseName].max = maxWeight;
            }

        }

    });

    if (Object.keys(exerciseStats).length === 0) {

        container.innerHTML = `
            <div class="text-center py-8 opacity-50">
                <div class="text-3xl mb-2">📈</div>
                <p>Нет данных прогресса</p>
            </div>
        `;

        return;
    }

    const sortedExercises = Object.values(exerciseStats)
        .sort((a, b) => b.max - a.max);

    let html = `
        <h3 class="text-lg font-bold mb-3">
            📈 Прогресс упражнений
        </h3>
    `;

    sortedExercises.forEach(exercise => {

        const records = exercise.records.sort(
            (a, b) => new Date(a.date) - new Date(b.date)
        );

        const lastWeight =
            records[records.length - 1]?.weight || 0;

        const previousWeight =
            records.length > 1
                ? records[records.length - 2].weight
                : lastWeight;

        const firstWeight =
            records[0]?.weight || 0;

        const progress =
            lastWeight - firstWeight;

        const firstDate = new Date(records[0]?.date);

        const firstDateFormatted =
            firstDate.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit'
            });

        html += `
            <div class="progress-card mb-2">

                <div class="progress-top-line">

                    <span class="progress-exercise">
                        ${exercise.name}
                    </span>

                    <span class="progress-records">
                        записей: ${records.length}
                    </span>

                </div>

                <div class="progress-bottom-line">

                    <span class="progress-current">
                        Рекорд ${exercise.max} кг
                    </span>

                    <span class="progress-prev">
                        Прошлый ${previousWeight} кг
                    </span>

                    <span class="
                        ${progress > 0 ? 'progress-positive' : ''}
                        ${progress < 0 ? 'progress-negative' : ''}
                    ">
                        ${progress > 0 ? '+' : ''}${progress} кг
                    </span>

                    <span class="progress-date">
                        с ${firstDateFormatted}
                    </span>

                </div>

            </div>
        `;
    });

    container.innerHTML = html;

loadChartExerciseSelector();

renderProgressChart();
}

function loadChartExerciseSelector() {

    const select =
        document.getElementById('chartExerciseSelect');

    if (!select) return;

    const history =
        JSON.parse(localStorage.getItem('workoutHistory') || '[]');

    const exercises = new Set();

    history.forEach(record => {

        for (let exerciseId in record.exercises) {

            const exercise = record.exercises[exerciseId];

            if (exercise?.name) {
                exercises.add(exercise.name);
            }

        }

    });

    const sortedExercises =
        Array.from(exercises).sort();

    select.innerHTML = sortedExercises.map(name => `
        <option value="${name}">
            ${name}
        </option>
    `).join('');
}

// ============================================
// СПРАВОЧНИК (ГАЙДЫ)
// ============================================

function loadExercisesGuide() {
    const container = document.getElementById('exercisesGuide');
    const categories = {};

    allExercises.forEach(exercise => {
        if (!categories[exercise.category]) categories[exercise.category] = [];
        categories[exercise.category].push(exercise);
    });

    let html = '';

    Object.keys(categories).forEach(category => {
        html += `
            <div class="mb-6">
                <h3 class="guide-category-title">${escapeHTML(category)}</h3>
                <div class="space-y-3">
        `;

        categories[category].forEach(exercise => {
            html += `
                <div class="card-modern">
                    <div class="flex justify-between items-center mb-2">
                        <div class="flex items-center gap-3">
                            <span class="text-2xl">${exercise.emoji}</span>
                            <span class="font-semibold">${exercise.name}</span>
                        </div>
                        <a href="${exercise.youtubeUrl}" target="_blank" class="youtube-link">▶️ Видео</a>
                    </div>
                    ${exercise.muscleGroups ? `<div class="text-sm opacity-70 ml-11">${exercise.muscleGroups}</div>` : ''}
                </div>
            `;
        });

        html += `</div></div>`;
    });

    container.innerHTML = html;
}

// ============================================
// AI ТРЕНЕР
// ============================================

function loadAITrainerPage() {
    const data = readStorageJSON('aiTrainerData', null);
    if (!data) return;

    document.getElementById('aiGender').value = data.gender || 'Мужской';
    document.getElementById('aiAge').value = data.age || '';
    document.getElementById('aiWeight').value = data.weight || '';
    document.getElementById('aiHeight').value = data.height || '';
    document.getElementById('aiExperience').value = data.experience || 'Новичок (0-6 месяцев)';
    document.getElementById('aiGoal').value = data.goal || 'Набор мышечной массы';
    document.getElementById('aiEquipment').value = data.equipment || 'Полный зал (штанги, гантели, тренажеры)';
    document.getElementById('aiPreferredExercises').value = data.preferredExercises || '';

    if (data.focusAreas?.length > 0) {
        const select = document.getElementById('aiFocusAreas');
        for (let option of select.options) {
            option.selected = data.focusAreas.includes(option.value);
        }
    }
}

async function generateAIPlan() {
    const gender             = document.getElementById('aiGender').value;
    const age                = document.getElementById('aiAge').value;
    const weight             = document.getElementById('aiWeight').value;
    const height             = document.getElementById('aiHeight').value;
    const experience         = document.getElementById('aiExperience').value;
    const goal               = document.getElementById('aiGoal').value;
    const equipment          = document.getElementById('aiEquipment').value;
    const preferredExercises = document.getElementById('aiPreferredExercises').value.trim();
    const focusAreas         = Array.from(document.getElementById('aiFocusAreas').selectedOptions).map(o => o.value);

    if (!age || !weight || !height) {
        tg.showAlert('⚠️ Заполни все поля!');
        return;
    }

    setStorageItem('aiTrainerData', JSON.stringify({
        gender, age, weight, height, experience, goal, equipment, preferredExercises, focusAreas
    }));

    const btn = document.getElementById('generateBtn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '⏳ Генерирую план...';
    btn.disabled = true;

    try {
        const response = await fetch(API_WORKOUT_PLAN_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gender, age, weight, height, experience, goal, equipment, preferredExercises, focusAreas })
        });

        if (!response.ok) throw new Error('Ошибка API');

        const data = await response.json();

        if (data.isText) {
            document.getElementById('aiPlanContent').textContent = data.plan;
            setStorageItem('lastGeneratedAIPlan', JSON.stringify({
                plan: data.plan, isText: true,
                userData: { gender, age, weight, height, experience, goal, equipment, preferredExercises, focusAreas },
                timestamp: new Date().toISOString()
            }));
        } else {
            document.getElementById('aiPlanContent').textContent = formatPlanAsText(data.plan);
            setStorageItem('lastGeneratedAIPlan', JSON.stringify({
                plan: data.plan, isText: false,
                userData: { gender, age, weight, height, experience, goal, equipment, preferredExercises, focusAreas },
                timestamp: new Date().toISOString()
            }));
        }

        document.getElementById('aiPlanResult').classList.remove('hidden');
        document.getElementById('aiPlanResult').scrollIntoView({ behavior: 'smooth' });
        tg.showAlert('✅ План готов!');

    } catch (error) {
        console.error('Error:', error);
        tg.showAlert('❌ Ошибка при генерации плана. Проверь подключение к интернету.');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

function formatPlanAsText(plan) {
    let text = '';

    ['A', 'B', 'C'].forEach(day => {
        if (!plan[day]) return;
        text += `\n${plan[day].emoji} ${plan[day].name}\n`;
        text += '─'.repeat(40) + '\n\n';
        plan[day].exercises.forEach((ex, index) => {
            text += `${index + 1}. ${ex.emoji} ${ex.name}\n`;
            text += `   Подходы: ${ex.sets} x ${ex.reps}\n`;
            text += `   Техника: ${ex.technique}\n\n`;
        });
    });

    if (plan.nutrition) text += `\n🍎 Питание\n${'─'.repeat(40)}\n${plan.nutrition}\n\n`;
    if (plan.rest)      text += `\n😴 Отдых\n${'─'.repeat(40)}\n${plan.rest}\n`;

    return text;
}

function saveAIPlanToWorkouts() {
    const lastPlan = localStorage.getItem('lastGeneratedAIPlan');
    if (!lastPlan) {
        tg.showAlert('⚠️ Нет сгенерированного плана');
        return;
    }

    const planData = readStorageJSON('lastGeneratedAIPlan', null);
    if (!planData) {
        tg.showAlert('⚠️ Сгенерированный план поврежден. Создай новый план.');
        return;
    }

    if (planData.isText) {
        tg.showAlert('⚠️ Этот план в старом формате. Сгенерируй новый план для сохранения.');
        return;
    }

    let aiPlans = readStorageJSON(AI_PLANS_STORAGE_KEY, []);

    const newPlan = {
        id: 'ai_' + Date.now(),
        name: `AI План - ${planData.userData.goal}`,
        description: `Пол: ${planData.userData.gender}, Возраст: ${planData.userData.age}, Опыт: ${planData.userData.experience}`,
        program: planData.plan,
        userData: planData.userData,
        createdAt: planData.timestamp
    };

    aiPlans.push(newPlan);
    setStorageItem(AI_PLANS_STORAGE_KEY, JSON.stringify(aiPlans));
    tg.showAlert('✅ План добавлен в Тренировки!');
}

// ============================================
// ЗАПУСК
// ============================================

window.onload = () => init();
