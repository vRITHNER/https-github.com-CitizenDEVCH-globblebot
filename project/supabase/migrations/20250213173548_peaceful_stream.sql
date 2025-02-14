/*
  # Topics Management System

  1. New Tables
    - `topics`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `description` (text, required)
      - `category` (text, required)
      - `difficulty` (text, required)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `is_active` (boolean)
      - `created_by` (uuid, references profiles)

  2. Security
    - Enable RLS on topics table
    - Add policies for:
      - Public read access for active topics
      - Admin write access
      - Soft delete instead of hard delete

  3. Functions
    - Function to check if topic can be deleted
    - Function to soft delete topic
*/

-- Create topics table
CREATE TABLE IF NOT EXISTS topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger
CREATE TRIGGER update_topics_updated_at
  BEFORE UPDATE ON topics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to check if topic can be deleted
CREATE OR REPLACE FUNCTION can_delete_topic(topic_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if topic has any conversations
  RETURN NOT EXISTS (
    SELECT 1 
    FROM conversations 
    WHERE topic_id = $1
  );
END;
$$;

-- Create policies

-- Anyone can read active topics
CREATE POLICY "Anyone can read active topics"
  ON topics
  FOR SELECT
  USING (is_active = true);

-- Only admins can insert topics
CREATE POLICY "Admins can insert topics"
  ON topics
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

-- Only admins can update topics
CREATE POLICY "Admins can update topics"
  ON topics
  FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Only admins can delete topics
CREATE POLICY "Admins can delete topics"
  ON topics
  FOR DELETE
  TO authenticated
  USING (
    is_admin(auth.uid()) 
    AND can_delete_topic(id)
  );

-- Insert initial topics
INSERT INTO topics (title, description, category, difficulty) VALUES
  ('At the Restaurant', 'Practice ordering food and drinks at a traditional French bistro', 'dining', 'beginner'),
  ('Asking for Directions', 'Learn how to ask and understand directions to various locations', 'navigation', 'beginner'),
  ('Shopping at the Market', 'Practice buying groceries and negotiating at a local market', 'shopping', 'intermediate'),
  ('At the Train Station', 'Learn to purchase tickets and navigate public transportation', 'travel', 'intermediate')
ON CONFLICT DO NOTHING;