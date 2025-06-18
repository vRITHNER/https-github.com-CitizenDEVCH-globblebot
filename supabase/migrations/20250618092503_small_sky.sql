/*
  # Add is_admin field to profiles

  1. Changes
    - Add is_admin boolean field to profiles table
    - Default to false
    - Update is_admin function to use this field

  2. Security
    - Maintain existing RLS policies
*/

-- Add is_admin field to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- Update the is_admin function to use the profile field
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN COALESCE((
    SELECT is_admin 
    FROM profiles 
    WHERE id = user_id
  ), false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;