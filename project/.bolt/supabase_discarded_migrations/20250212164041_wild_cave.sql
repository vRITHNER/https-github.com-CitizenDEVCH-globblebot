/*
  # Update profiles table structure

  1. Changes
    - Add email column to profiles table
    - Add role column to profiles table
    - Update existing profiles with email from auth.users
    - Add policies for new columns

  2. Security
    - Maintain existing RLS policies
    - Add policy for email visibility
*/

-- Add new columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS role text;

-- Update existing profiles with email from auth.users
UPDATE profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id;

-- Make email column NOT NULL after populating data
ALTER TABLE profiles 
ALTER COLUMN email SET NOT NULL;

-- Update existing profiles with role from user_roles
UPDATE profiles p
SET role = r.name
FROM user_roles ur
JOIN roles r ON r.id = ur.role_id
WHERE p.id = ur.user_id;

-- Add constraint to ensure role matches valid roles
ALTER TABLE profiles
ADD CONSTRAINT valid_role CHECK (role IN ('admin', 'student'));

-- Set default role as 'student' for new profiles
ALTER TABLE profiles
ALTER COLUMN role SET DEFAULT 'student';

-- Make role column NOT NULL
ALTER TABLE profiles
ALTER COLUMN role SET NOT NULL;

-- Add policy for email visibility
CREATE POLICY "Users can only see their own email"
ON profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id OR 
  (SELECT is_admin(auth.uid()))
);

-- Update existing profile policies to include new columns
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND
  (
    CASE 
      WHEN role IS DISTINCT FROM OLD.role THEN
        (SELECT is_admin(auth.uid()))
      ELSE true
    END
  )
);