-- website/migrations/004_add_updated_at_triggers.sql
-- Migration: Add reusable trigger function and attach it to posts and messages tables
-- Run: psql -U postgres -d islam_site -f migrations/004_add_updated_at_trigger.sql

BEGIN;

-- 1. Create a generic PL/pgSQL function to update the updated_at column
CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.date = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Create trigger for 'post' table
DROP TRIGGER IF EXISTS trigger_post_date ON post;
CREATE TRIGGER trigger_post_date
BEFORE UPDATE ON post
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_timestamp();

-- 3. Create trigger for 'messages' table
DROP TRIGGER IF EXISTS trigger_messages_date ON messages;
CREATE TRIGGER trigger_messages_date
BEFORE UPDATE ON messages
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_timestamp();

COMMIT;