/*
  # Add Comments System

  1. New Tables
    - `comments`
      - `id` (uuid, primary key)
      - `confession_id` (uuid, foreign key to confessions)
      - `author` (text, anonymous username)
      - `text` (text, comment content)
      - `created_at` (timestamp)
      - `expires_at` (timestamp, for 24h auto-deletion)

  2. Security
    - Enable RLS on comments table
    - Add policies for anonymous users to read/write comments

  3. Functions
    - Update cleanup function to include comments
*/

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  confession_id uuid REFERENCES confessions(id) ON DELETE CASCADE,
  author text NOT NULL DEFAULT ('User' || floor(random() * 1000)::text),
  text text NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT now() + interval '24 hours'
);

-- Enable Row Level Security
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Comments policies (allow anonymous access for MVP)
CREATE POLICY "Anyone can read comments"
  ON comments
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Anyone can insert comments"
  ON comments
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS comments_confession_id_idx ON comments(confession_id);
CREATE INDEX IF NOT EXISTS comments_created_at_idx ON comments(created_at);
CREATE INDEX IF NOT EXISTS comments_expires_at_idx ON comments(expires_at);

-- Update cleanup function to include comments
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
  
  -- Delete expired comments
  DELETE FROM comments 
  WHERE expires_at < now();
  
  RAISE NOTICE 'Cleaned up expired content including comments';
END;
$$;

-- Apply trigger to comments for auto-expiration
DROP TRIGGER IF EXISTS set_comments_expires_at ON comments;
CREATE TRIGGER set_comments_expires_at
  BEFORE INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION set_expires_at();

-- Add sample comments to existing confessions
INSERT INTO comments (confession_id, author, text, created_at) 
SELECT 
  id as confession_id,
  'User' || floor(random() * 1000)::text as author,
  CASE 
    WHEN random() < 0.3 THEN 'This is so relatable! Thanks for sharing.'
    WHEN random() < 0.6 THEN 'Wow, that''s rough. Hope things get better for you.'
    ELSE 'Been there! You''re not alone in this.'
  END as text,
  created_at - interval '1 hour' as created_at
FROM confessions 
WHERE random() < 0.7  -- Add comments to ~70% of existing confessions
LIMIT 20;  -- Limit to prevent too many sample comments