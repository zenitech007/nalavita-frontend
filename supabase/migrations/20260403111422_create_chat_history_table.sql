/*
  # Create Chat History Table for Session Management

  1. New Tables
    - `ChatHistory`
      - `id` (uuid, primary key)
      - `session_id` (uuid) - Groups messages in a session
      - `user_id` (uuid, foreign key) - References auth.users
      - `user_message` (text) - Patient's message
      - `ai_response` (text) - AMELIA's response
      - `image_data` (text) - Optional base64 image
      - `urgency_level` (text) - Classified urgency (EMERGENCY, URGENT, NON-URGENT)
      - `created_at` (timestamptz) - When message was sent

  2. Security
    - Enable RLS on `ChatHistory` table
    - Add policy for authenticated users to read their own chat history
    - Add policy for authenticated users to insert their own messages

  3. Indexes
    - Index on user_id for fast history retrieval
    - Index on session_id for grouping messages
    - Index on created_at for chronological ordering

  4. Important Notes
    - Stores all chat interactions for continuity and learning
    - Session-based grouping for conversation context
    - Urgency classification for clinical audit trail
    - Base64 images stored for vision-based analysis review
*/

CREATE TABLE IF NOT EXISTS chat_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_message text NOT NULL,
  ai_response text NOT NULL,
  image_data text,
  urgency_level text DEFAULT 'NON-URGENT',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_session_id ON chat_history(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_created_at ON chat_history(created_at DESC);

ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own chat history"
  ON chat_history
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own chat messages"
  ON chat_history
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());