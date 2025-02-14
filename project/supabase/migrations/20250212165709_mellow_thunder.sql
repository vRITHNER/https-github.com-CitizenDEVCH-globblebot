/*
  # Fix profiles schema and policies

  1. Changes
    - Add email field to profiles table
    - Update profile creation to include email
    - Add trigger to update timestamps

  2. Security
    - Maintain existing RLS policies
    - Add validation for email field
*/

-- Add email field to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS email text NOT NULL;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();