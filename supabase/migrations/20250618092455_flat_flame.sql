/*
  # Create admin user function

  1. Function
    - Creates a function to promote a user to admin
    - Can be called manually to create admin users
    - Checks if user exists before promoting

  2. Usage
    - Call: SELECT promote_user_to_admin('user-email@example.com');
*/

-- Function to promote a user to admin
CREATE OR REPLACE FUNCTION promote_user_to_admin(user_email text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
  admin_role_id uuid;
BEGIN
  -- Get user ID from auth.users
  SELECT id INTO user_id
  FROM auth.users
  WHERE email = user_email;

  IF user_id IS NULL THEN
    RETURN 'User not found';
  END IF;

  -- Get admin role ID
  SELECT id INTO admin_role_id
  FROM roles
  WHERE name = 'admin';

  IF admin_role_id IS NULL THEN
    RETURN 'Admin role not found';
  END IF;

  -- Add admin role to user (if not already exists)
  INSERT INTO user_roles (user_id, role_id)
  VALUES (user_id, admin_role_id)
  ON CONFLICT (user_id, role_id) DO NOTHING;

  -- Update profile to mark as admin
  UPDATE profiles
  SET is_admin = true
  WHERE id = user_id;

  RETURN 'User promoted to admin successfully';
END;
$$;