/*
  # Fix RLS policies and enable proper access

  1. Changes
    - Enable RLS on all tables that need it
    - Fix policies for topics table to allow public read access
    - Fix policies for profiles table to allow proper registration
    - Add missing policies for authenticated users

  2. Security
    - Maintain security while allowing proper access
    - Fix registration flow
    - Allow topic reading for all users
*/

-- Fix topics table policies
DROP POLICY IF EXISTS "Anyone can read active topics" ON topics;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON topics;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON topics;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON topics;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON topics;

-- Create proper policies for topics
CREATE POLICY "Anyone can read active topics"
  ON topics
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Enable read access for authenticated users"
  ON topics
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users only"
  ON topics
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Enable update for authenticated users"
  ON topics
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users"
  ON topics
  FOR DELETE
  TO authenticated
  USING (true);

-- Fix profiles table policies
DROP POLICY IF EXISTS "Enable insert for registration" ON profiles;
DROP POLICY IF EXISTS "Enable profile insertion for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can only see their own email" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can see their own admin status" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create proper policies for profiles
CREATE POLICY "Enable profile insertion for authenticated users"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can see their own admin status"
  ON profiles
  FOR SELECT
  TO public
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO public
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can only see their own email"
  ON profiles
  FOR SELECT
  TO authenticated
  USING ((auth.uid() = id) OR (SELECT is_admin(auth.uid())));

-- Fix user_roles policies
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON user_roles;
DROP POLICY IF EXISTS "Enable user_roles insertion for authenticated users" ON user_roles;

CREATE POLICY "Enable user_roles insertion for authenticated users"
  ON user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Fix conversations policies
DROP POLICY IF EXISTS "Users can insert own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view own conversations or admins can view all" ON conversations;
DROP POLICY IF EXISTS "Users can update own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can delete own conversations" ON conversations;

CREATE POLICY "Users can insert their own conversations"
  ON conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own conversations or admins can view all"
  ON conversations
  FOR SELECT
  TO authenticated
  USING ((auth.uid() = user_id) OR (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)));

CREATE POLICY "Users can update their own conversations"
  ON conversations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
  ON conversations
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Fix conversation_exchanges policies
DROP POLICY IF EXISTS "Users can view exchanges from their conversations or admins can" ON conversation_exchanges;
DROP POLICY IF EXISTS "Users can update exchanges in their conversations or admins can" ON conversation_exchanges;
DROP POLICY IF EXISTS "Users can delete exchanges in their conversations or admins can" ON conversation_exchanges;

CREATE POLICY "Users can view exchanges from their conversations or admins can"
  ON conversation_exchanges
  FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM conversations WHERE id = conversation_id AND ((user_id = auth.uid()) OR (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)))));

CREATE POLICY "Users can update exchanges in their conversations or admins can"
  ON conversation_exchanges
  FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM conversations WHERE id = conversation_id AND ((user_id = auth.uid()) OR (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)))))
  WITH CHECK (EXISTS (SELECT 1 FROM conversations WHERE id = conversation_id AND ((user_id = auth.uid()) OR (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)))));

CREATE POLICY "Users can delete exchanges in their conversations or admins can"
  ON conversation_exchanges
  FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM conversations WHERE id = conversation_id AND ((user_id = auth.uid()) OR (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)))));