/*
  # Add conversations and exchanges tables

  1. New Tables
    - `conversations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `topic_id` (uuid, references topics)
      - `started_at` (timestamptz)
      - `ended_at` (timestamptz, nullable)
      - `duration` (integer, nullable)
      - `accuracy` (integer, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `conversation_exchanges`
      - `id` (uuid, primary key)
      - `conversation_id` (uuid, references conversations)
      - `role` (text, either 'student' or 'ai')
      - `message` (text)
      - `accuracy` (integer, nullable)
      - `feedback` (text, nullable)
      - `timestamp` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for user access
*/

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  topic_id uuid REFERENCES topics(id) ON DELETE CASCADE NOT NULL,
  started_at timestamptz NOT NULL,
  ended_at timestamptz,
  duration integer,
  accuracy integer CHECK (accuracy >= 0 AND accuracy <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create conversation_exchanges table
CREATE TABLE IF NOT EXISTS conversation_exchanges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('student', 'ai')),
  message text NOT NULL,
  accuracy integer CHECK (accuracy >= 0 AND accuracy <= 100),
  feedback text,
  timestamp timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_exchanges ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger for conversations
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create policies for conversations
CREATE POLICY "Users can insert their own conversations"
  ON conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own conversations"
  ON conversations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
  ON conversations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for conversation_exchanges
CREATE POLICY "Users can insert exchanges in their conversations"
  ON conversation_exchanges
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE id = conversation_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view exchanges from their conversations"
  ON conversation_exchanges
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE id = conversation_id
      AND user_id = auth.uid()
    )
  );

-- Create function to get latest conversation for a user and topic
CREATE OR REPLACE FUNCTION get_latest_conversation(p_user_id uuid, p_topic_id uuid)
RETURNS TABLE (
  conversation_id uuid,
  started_at timestamptz,
  ended_at timestamptz,
  duration integer,
  accuracy integer,
  exchanges json
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as conversation_id,
    c.started_at,
    c.ended_at,
    c.duration,
    c.accuracy,
    json_agg(
      json_build_object(
        'id', ce.id,
        'role', ce.role,
        'message', ce.message,
        'accuracy', ce.accuracy,
        'feedback', ce.feedback,
        'timestamp', ce.timestamp
      ) ORDER BY ce.timestamp
    ) as exchanges
  FROM conversations c
  LEFT JOIN conversation_exchanges ce ON ce.conversation_id = c.id
  WHERE c.user_id = p_user_id
  AND c.topic_id = p_topic_id
  GROUP BY c.id
  ORDER BY c.started_at DESC
  LIMIT 1;
END;
$$;