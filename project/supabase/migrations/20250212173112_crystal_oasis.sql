/*
  # Fix profile email field

  1. Changes
    - Make email field optional in profiles table
    - Add trigger to copy email from auth.users

  2. Security
    - Maintains existing RLS policies
*/

-- Make email field optional
ALTER TABLE profiles 
ALTER COLUMN email DROP NOT NULL;

-- Create function to sync email from auth.users
CREATE OR REPLACE FUNCTION sync_profile_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Get email from auth.users
  NEW.email = (
    SELECT email 
    FROM auth.users 
    WHERE id = NEW.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically sync email
CREATE TRIGGER sync_profile_email_trigger
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_profile_email();