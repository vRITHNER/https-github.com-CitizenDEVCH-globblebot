/*
  # Fix accuracy data type and conversation history function

  1. Changes
    - Change accuracy column type from integer to numeric(5,2) in conversations table
    - Change accuracy column type from integer to numeric(5,2) in conversation_exchanges table
    - Drop and recreate get_conversation_history function with updated return type
    - Update check constraints to work with decimal values
  
  2. Notes
    - Uses numeric(5,2) to allow values like 92.50 with 2 decimal places
    - Maximum value: 999.99
    - Function is dropped first to avoid return type conflicts
*/

-- Drop the existing function first
DROP FUNCTION IF EXISTS get_conversation_history(uuid, uuid);

-- Update conversations table
ALTER TABLE conversations 
  ALTER COLUMN accuracy TYPE numeric(5,2) USING accuracy::numeric(5,2),
  DROP CONSTRAINT IF EXISTS conversations_accuracy_check,
  ADD CONSTRAINT conversations_accuracy_check 
    CHECK (accuracy >= 0 AND accuracy <= 100);

-- Update conversation_exchanges table
ALTER TABLE conversation_exchanges 
  ALTER COLUMN accuracy TYPE numeric(5,2) USING accuracy::numeric(5,2),
  DROP CONSTRAINT IF EXISTS conversation_exchanges_accuracy_check,
  ADD CONSTRAINT conversation_exchanges_accuracy_check 
    CHECK (accuracy >= 0 AND accuracy <= 100);

-- Recreate the function with the new return type
CREATE OR REPLACE FUNCTION get_conversation_history(p_user_id uuid, p_topic_id uuid)
RETURNS TABLE (
  conversation_id uuid,
  started_at timestamptz,
  ended_at timestamptz,
  duration integer,
  accuracy numeric(5,2),
  exchanges json
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as conversation_id,
    c.started_at,
    c.ended_at,
    c.duration,
    c.accuracy,
    json_agg(
      json_build_object(
        'id', ce.id,
        'role', ce.role,
        'message', ce.message,
        'accuracy', ce.accuracy,
        'feedback', ce.feedback,
        'timestamp', ce.timestamp
      ) ORDER BY ce.timestamp
    ) as exchanges
  FROM conversations c
  LEFT JOIN conversation_exchanges ce ON ce.conversation_id = c.id
  WHERE c.user_id = p_user_id
  AND c.topic_id = p_topic_id
  GROUP BY c.id
  ORDER BY c.started_at DESC;
END;
$$;