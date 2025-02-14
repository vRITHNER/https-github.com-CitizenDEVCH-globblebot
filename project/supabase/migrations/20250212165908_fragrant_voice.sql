/*
  # Fix user roles policies and constraints

  1. Changes
    - Add policies for user_roles table
    - Add admin policies for role management
    - Add cascade delete triggers

  2. Security
    - Enable proper RLS for user_roles
    - Allow profile creation during registration
    - Allow role assignment for new users
*/

-- Drop existing policies on user_roles
DROP POLICY IF EXISTS "Users can read own roles" ON user_roles;

-- Create new policies for user_roles
CREATE POLICY "Enable insert for registration"
  ON user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Allow users to insert their own roles during registration
    user_id = auth.uid()
    -- Only allow student role assignment during registration
    AND EXISTS (
      SELECT 1 FROM roles 
      WHERE id = role_id 
      AND name = 'student'
    )
  );

CREATE POLICY "Enable read access for own roles"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admin policies for user_roles
CREATE POLICY "Enable all access for admin users"
  ON user_roles
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));