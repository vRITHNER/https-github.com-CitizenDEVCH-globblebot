/*
  # Fix profiles table policies

  1. Changes
    - Add policy for inserting new profiles during registration
    - Update existing select policy to allow reading all profiles
    - Add policy for admin users to manage all profiles

  2. Security
    - Maintain RLS on profiles table
    - Allow users to create their own profile during registration
    - Allow users to read all profiles (needed for display names)
    - Give admins full access
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create new policies
CREATE POLICY "Enable insert for registration"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable read access for all users"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable update for users own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admin policies
CREATE POLICY "Enable all access for admin users"
  ON profiles
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));