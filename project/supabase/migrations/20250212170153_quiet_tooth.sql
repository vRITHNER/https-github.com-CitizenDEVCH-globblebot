/*
  # Add function to get student role

  1. Changes
    - Add function to safely get the student role ID
    - Function is accessible to authenticated users
    - Returns the role ID for the 'student' role
    
  2. Security
    - Function is SECURITY DEFINER to bypass RLS
    - Only returns the student role, no other roles
*/

-- Function to get student role ID
CREATE OR REPLACE FUNCTION get_student_role()
RETURNS TABLE (id uuid) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT r.id
  FROM roles r
  WHERE r.name = 'student'
  LIMIT 1;
END;
$$;