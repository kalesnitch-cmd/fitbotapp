# Supabase Sync Setup

Этот проект теперь умеет синхронизировать пользовательские данные через Supabase по `Telegram user id`.

## 1. Создай таблицу

В Supabase SQL Editor выполни:

```sql
create table if not exists public.user_app_state (
  telegram_id bigint primary key,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);
```

## 2. Добавь переменные окружения

В Vercel Project Settings -> Environment Variables добавь:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TELEGRAM_BOT_TOKEN`
- `GROQ_API_KEY`

Локально их можно положить в `.env.local`.

## 3. Как это работает

- Клиент получает `initData` от Telegram Mini App.
- API-роут `/api/user-state` валидирует подпись `initData` через `TELEGRAM_BOT_TOKEN`.
- После проверки сервер читает и сохраняет JSON-состояние пользователя в `user_app_state`.
- Ключ записи — `telegram_id`, поэтому один и тот же пользователь увидит историю и план с телефона и десктопа в Telegram.

## 4. Что именно синхронизируется

- выбранная программа
- пользовательские правки программ
- текущая незавершённая тренировка
- история тренировок
- кастомные упражнения
- AI-планы и анкета AI-тренера

## 5. Ограничение

Синхронизация работает именно внутри Telegram Mini App, потому что только там приложение получает доверенный `initData` пользователя.
