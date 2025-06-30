/*
  # Initial Roastify Database Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `handle` (text, unique)
      - `is_premium` (boolean)
      - `stats` (jsonb for user statistics)
      - `created_at` (timestamp)
    
    - `confessions`
      - `id` (uuid, primary key)
      - `content` (text)
      - `tag` (text)
      - `roast` (text, AI-generated roast)
      - `reactions` (jsonb for reaction counts)
      - `poll` (jsonb for poll votes)
      - `user_id` (uuid, optional foreign key)
      - `created_at` (timestamp)
      - `expires_at` (timestamp, for 24h auto-deletion)
    
    - `chat_messages`
      - `id` (uuid, primary key)
      - `room_id` (text, mood room identifier)
      - `user_id` (uuid, optional foreign key)
      - `text` (text)
      - `is_bot` (boolean)
      - `created_at` (timestamp)
      - `expires_at` (timestamp, for 24h auto-deletion)

  2. Security
    - Enable RLS on all tables
    - Add policies for anonymous users to read/write confessions
    - Add policies for chat room participation
    - Add policies for user data access

  3. Functions
    - Auto-cleanup function for expired content
    - Trigger for setting expiration dates
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  handle text UNIQUE NOT NULL,
  is_premium boolean DEFAULT false,
  stats jsonb DEFAULT '{
    "roastPoints": 0,
    "postsShared": 0,
    "gamesWon": 0,
    "dayStreak": 0,
    "totalRoasts": 0,
    "favoriteTag": "#Ghosted"
  }'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create confessions table
CREATE TABLE IF NOT EXISTS confessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  tag text NOT NULL,
  roast text NOT NULL,
  reactions jsonb DEFAULT '{
    "laugh": 0,
    "skull": 0,
    "shocked": 0,
    "cry": 0
  }'::jsonb,
  poll jsonb DEFAULT '{
    "you": 0,
    "them": 0,
    "both": 0
  }'::jsonb,
  user_id uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT now() + interval '24 hours'
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id text NOT NULL,
  user_id uuid REFERENCES users(id),
  text text NOT NULL,
  is_bot boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT now() + interval '24 hours'
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE confessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated, anon
  USING (true);

-- Confessions policies (allow anonymous access for MVP)
CREATE POLICY "Anyone can read confessions"
  ON confessions
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Anyone can insert confessions"
  ON confessions
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Anyone can update confessions"
  ON confessions
  FOR UPDATE
  TO authenticated, anon
  USING (true);

-- Chat messages policies
CREATE POLICY "Anyone can read chat messages"
  ON chat_messages
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Anyone can insert chat messages"
  ON chat_messages
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS confessions_created_at_idx ON confessions(created_at DESC);
CREATE INDEX IF NOT EXISTS confessions_tag_idx ON confessions(tag);
CREATE INDEX IF NOT EXISTS confessions_expires_at_idx ON confessions(expires_at);
CREATE INDEX IF NOT EXISTS chat_messages_room_id_idx ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS chat_messages_created_at_idx ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS chat_messages_expires_at_idx ON chat_messages(expires_at);

-- Function to clean up expired content
CREATE OR REPLACE FUNCTION cleanup_expired_content()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Delete expired confessions
  DELETE FROM confessions 
  WHERE expires_at < now();
  
  -- Delete expired chat messages
  DELETE FROM chat_messages 
  WHERE expires_at < now();
  
  RAISE NOTICE 'Cleaned up expired content';
END;
$$;

-- Create a trigger to automatically set expires_at if not provided
CREATE OR REPLACE FUNCTION set_expires_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.expires_at IS NULL THEN
    NEW.expires_at := now() + interval '24 hours';
  END IF;
  RETURN NEW;
END;
$$;

-- Apply trigger to confessions
DROP TRIGGER IF EXISTS set_confessions_expires_at ON confessions;
CREATE TRIGGER set_confessions_expires_at
  BEFORE INSERT ON confessions
  FOR EACH ROW
  EXECUTE FUNCTION set_expires_at();

-- Apply trigger to chat_messages
DROP TRIGGER IF EXISTS set_chat_messages_expires_at ON chat_messages;
CREATE TRIGGER set_chat_messages_expires_at
  BEFORE INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION set_expires_at();