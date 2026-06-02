// Vercel Serverless Function для Groq API
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

const normalizeText = (value, fallback = '') =>
    typeof value === 'string' ? value.trim() : fallback;

const normalizeArray = (value) =>
    Array.isArray(value) ? value.map(item => normalizeText(item)).filter(Boolean) : [];

export default async function handler(req, res) {
    // Разрешаем CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const groqApiKey = process.env.GROQ_API_KEY;

        if (!groqApiKey) {
            return res.status(500).json({ error: 'Groq API key is not configured' });
        }

        const body = req.body || {};
        const gender = normalizeText(body.gender, 'Не указан');
        const age = Number(body.age);
        const weight = Number(body.weight);
        const height = Number(body.height);
        const experience = normalizeText(body.experience, 'Не указан');
        const goal = normalizeText(body.goal, 'Не указана');
        const equipment = normalizeText(body.equipment, 'Не указано');
        const preferredExercises = normalizeText(body.preferredExercises);
        const focusAreas = normalizeArray(body.focusAreas);

        if (!Number.isFinite(age) || !Number.isFinite(weight) || !Number.isFinite(height)) {
            return res.status(400).json({ error: 'Age, weight and height must be numbers' });
        }

        // Формирование текста о приоритетных зонах
        let focusAreasText = '';
        if (focusAreas && focusAreas.length > 0) {
            focusAreasText = `\n- Приоритетные зоны для проработки: ${focusAreas.join(', ')}`;
        }

        // Добавляем случайный элемент для вариативности
        const variations = [
            'Предложи разнообразные упражнения.',
            'Используй разные варианты упражнений для каждой группы мышц.',
            'Составь уникальную комбинацию упражнений.',
            'Предложи альтернативные упражнения для разнообразия.',
            'Создай оригинальный план с нестандартными упражнениями.'
        ];
        const randomVariation = variations[Math.floor(Math.random() * variations.length)];

        const prompt = `Ты профессиональный тренер. Составь персональный план тренировок на неделю в формате JSON.

Данные клиента:
- Пол: ${gender}
- Возраст: ${age} лет
- Вес: ${weight} кг
- Рост: ${height} см
- Опыт тренировок: ${experience}
- Цель: ${goal}
- Доступное оборудование: ${equipment}${focusAreasText}
${preferredExercises ? `- Предпочитаемые упражнения: ${preferredExercises}` : ''}

${focusAreas && focusAreas.length > 0 ? `ВАЖНО: Клиент хочет больше прорабатывать: ${focusAreas.join(', ')}. Составь план с акцентом на эти зоны - добавь больше упражнений и подходов на эти группы мышц.` : ''}

${preferredExercises ? 'ВАЖНО: Постарайся включить указанные предпочитаемые упражнения в план, если они подходят под цель и уровень клиента.' : ''}

${randomVariation}

Учитывай пол клиента при составлении плана (например, для женщин больше акцента на ягодицы и ноги, для мужчин - на верх тела).

ФОРМАТ ОТВЕТА - верни ТОЛЬКО JSON без дополнительного текста:
{
  "A": {
    "name": "День А - Название",
    "emoji": "🔥",
    "exercises": [
      {
        "id": "exercise_1",
        "name": "Название упражнения",
        "emoji": "💪",
        "sets": 4,
        "reps": "8-10",
        "technique": "Краткое описание техники выполнения"
      }
    ]
  },
  "B": {
    "name": "День Б - Название",
    "emoji": "💪",
    "exercises": [...]
  },
  "C": {
    "name": "День В - Название",
    "emoji": "⚡",
    "exercises": [...]
  },
  "nutrition": "Краткие рекомендации по питанию",
  "rest": "Рекомендации по отдыху"
}

Для каждого дня добавь 4-6 упражнений. Используй разные эмодзи для упражнений (💪, 🦵, 🏋️, 🎯, ⚡, 🔥, 🍑, 🦾).`;

        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${groqApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                messages: [
                    {
                        role: 'system',
                        content: 'Ты опытный фитнес-тренер, который составляет эффективные программы тренировок.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 1.0,
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            throw new Error(`Groq API error: ${response.status}`);
        }

        const data = await response.json();
        const planText = data.choices?.[0]?.message?.content;

        if (!planText) {
            throw new Error('Groq API returned an empty plan');
        }

        // Попытаться распарсить JSON из ответа
        let plan;
        try {
            // Убрать markdown код блоки если есть
            const jsonMatch = planText.match(/```json\s*([\s\S]*?)\s*```/) || planText.match(/```\s*([\s\S]*?)\s*```/);
            const jsonText = jsonMatch ? jsonMatch[1] : planText;
            plan = JSON.parse(jsonText.trim());
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            // Если не удалось распарсить, вернуть как текст
            return res.status(200).json({ plan: planText, isText: true });
        }

        return res.status(200).json({ plan, isText: false });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Failed to generate workout plan' });
    }
}
