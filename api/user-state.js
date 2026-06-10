import crypto from 'node:crypto';

const SUPABASE_TABLE = 'user_app_state';

function getServerSecret(name) {
    return process.env[name] || '';
}

function setCorsHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function createTelegramSecretKey(botToken) {
    return crypto
        .createHmac('sha256', 'WebAppData')
        .update(botToken)
        .digest();
}

function verifyTelegramInitData(initData, botToken) {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');

    if (!hash) {
        throw new Error('Telegram initData does not contain hash');
    }

    params.delete('hash');

    const dataCheckString = Array.from(params.entries())
        .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

    const secretKey = createTelegramSecretKey(botToken);
    const calculatedHash = crypto
        .createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex');

    if (calculatedHash !== hash) {
        throw new Error('Telegram initData hash is invalid');
    }

    const userJson = params.get('user');
    if (!userJson) {
        throw new Error('Telegram initData does not contain user');
    }

    const user = JSON.parse(userJson);
    if (!user?.id) {
        throw new Error('Telegram user id is missing');
    }

    return String(user.id);
}

async function supabaseRequest(path, options = {}) {
    const supabaseUrl = getServerSecret('SUPABASE_URL');
    const serviceRoleKey = getServerSecret('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error('Supabase environment variables are not configured');
    }

    const normalizedSupabaseUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');

    const response = await fetch(`${normalizedSupabaseUrl}/rest/v1/${path}`, {
        ...options,
        headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
            'Content-Type': 'application/json',
            ...(options.headers || {})
        }
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
        const message = payload?.message || payload?.error || `Supabase request failed with ${response.status}`;
        throw new Error(message);
    }

    return payload;
}

async function loadUserState(telegramUserId) {
    const query = `${SUPABASE_TABLE}?telegram_id=eq.${encodeURIComponent(telegramUserId)}&select=state,updated_at&limit=1`;
    const rows = await supabaseRequest(query, { method: 'GET' });
    const row = Array.isArray(rows) ? rows[0] : null;

    return {
        state: row?.state || null,
        updatedAt: row?.updated_at || null
    };
}

async function saveUserState(telegramUserId, state) {
    const updatedAt = new Date().toISOString();

    const rows = await supabaseRequest(SUPABASE_TABLE, {
        method: 'POST',
        headers: {
            Prefer: 'resolution=merge-duplicates,return=representation'
        },
        body: JSON.stringify([
            {
                telegram_id: telegramUserId,
                state,
                updated_at: updatedAt
            }
        ])
    });

    const row = Array.isArray(rows) ? rows[0] : null;

    return {
        state: row?.state || state,
        updatedAt: row?.updated_at || updatedAt
    };
}

export default async function handler(req, res) {
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const botToken = getServerSecret('TELEGRAM_BOT_TOKEN');
        if (!botToken) {
            return res.status(500).json({ error: 'TELEGRAM_BOT_TOKEN is not configured' });
        }

        const body = req.body || {};
        const initData = typeof body.initData === 'string' ? body.initData.trim() : '';

        if (!initData) {
            return res.status(400).json({ error: 'Telegram initData is required' });
        }

        const telegramUserId = verifyTelegramInitData(initData, botToken);

        if (body.state && typeof body.state === 'object') {
            const result = await saveUserState(telegramUserId, body.state);
            return res.status(200).json(result);
        }

        const result = await loadUserState(telegramUserId);
        return res.status(200).json(result);
    } catch (error) {
        console.error('User state sync error:', error);
        const message = error.message || 'Failed to sync user state';
        const statusCode = message.toLowerCase().includes('telegram initdata') ? 401 : 500;
        return res.status(statusCode).json({ error: message });
    }
}
