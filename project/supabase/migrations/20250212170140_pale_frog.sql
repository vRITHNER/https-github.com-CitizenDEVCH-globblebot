/*
  # Add policy for user roles during registration

  1. Changes
    - Add policy to allow service role to insert into user_roles table
    - This is needed because during registration, the user isn't authenticated yet
    
  2. Security
    - Only allows the service role (which is what Supabase uses internally) to insert
    - Maintains existing RLS policies for authenticated users
*/

-- Drop existing policies on user_roles that might conflict
DROP POLICY IF EXISTS "Enable insert for registration" ON user_roles;

-- Create new policy that allows service role to insert during registration
CREATE POLICY "Enable insert for service role"
  ON user_roles
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Recreate the authenticated user policy
CREATE POLICY "Enable insert for authenticated users"
  ON user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM roles 
      WHERE id = role_id 
      AND name = 'student'
    )
  );