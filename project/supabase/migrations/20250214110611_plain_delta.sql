/*
  # Update conversation history function

  1. Changes
    - Rename get_latest_conversation to get_conversation_history
    - Remove LIMIT 1 to return all conversations
    - Add order by started_at DESC to show newest first

  2. Security
    - Maintain RLS policies
    - Keep security definer setting
*/

-- Drop the old function
DROP FUNCTION IF EXISTS get_latest_conversation;

-- Create new function to get all conversations for a user and topic
CREATE OR REPLACE FUNCTION get_conversation_history(p_user_id uuid, p_topic_id uuid)
RETURNS TABLE (
  conversation_id uuid,
  started_at timestamptz,
  ended_at timestamptz,
  duration integer,
  accuracy integer,
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