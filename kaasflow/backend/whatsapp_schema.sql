CREATE TABLE IF NOT EXISTS kf_whatsapp_config (
    user_id       UUID PRIMARY KEY REFERENCES kf_users(id) ON DELETE CASCADE,
    instance_name TEXT NOT NULL,
    phone_number  TEXT DEFAULT '',
    is_connected  BOOLEAN DEFAULT FALSE,
    reminder_enabled BOOLEAN DEFAULT TRUE,
    reminder_time TEXT DEFAULT '09:00',  -- HH:MM in user's timezone
    due_today_enabled BOOLEAN DEFAULT TRUE,
    due_tomorrow_enabled BOOLEAN DEFAULT TRUE,
    overdue_enabled BOOLEAN DEFAULT TRUE,
    connected_at  TIMESTAMPTZ,
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);
