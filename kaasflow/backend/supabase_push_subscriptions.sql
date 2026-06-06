-- ============================================================
-- SamKass - Push Subscriptions Table
-- Stores browser push notification subscriptions
-- ============================================================

CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    subscription_json JSONB NOT NULL,
    endpoint TEXT NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_active ON push_subscriptions(active);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_push_subscriptions_updated_at
    BEFORE UPDATE ON push_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE push_subscriptions IS 'Stores browser push notification subscriptions for loan due reminders';
COMMENT ON COLUMN push_subscriptions.user_id IS 'User identifier (email or user ID)';
COMMENT ON COLUMN push_subscriptions.subscription_json IS 'Full PushSubscription object as JSON';
COMMENT ON COLUMN push_subscriptions.endpoint IS 'Push notification endpoint URL';
COMMENT ON COLUMN push_subscriptions.active IS 'Whether the subscription is active';
