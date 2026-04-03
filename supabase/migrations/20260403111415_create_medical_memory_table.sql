/*
  # Create Medical Memory Table for AMELIA AI Learning

  1. New Tables
    - `MedicalMemory`
      - `id` (uuid, primary key)
      - `userId` (uuid, foreign key) - References auth.users
      - `observation` (text) - Long-term medical fact about patient
      - `created_at` (timestamptz) - When fact was learned
      - `category` (text) - Type of memory (condition, medication, allergy, etc)
      - `confidence` (numeric) - Confidence score (0-1)

  2. Security
    - Enable RLS on `MedicalMemory` table
    - Add policy for authenticated users to read their own memories
    - Add policy for authenticated users to insert their own memories
    - Prevent deletion/update to maintain history integrity

  3. Indexes
    - Index on userId for fast memory retrieval
    - Index on created_at for chronological queries

  4. Important Notes
    - Medical memories are permanent learning records
    - Self-extracting from chat responses via AI
    - Powers long-term patient context in clinical reasoning
    - Immutable after creation (no updates/deletes)
*/

CREATE TABLE IF NOT EXISTS medical_memory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  observation text NOT NULL,
  category text DEFAULT 'general',
  confidence numeric DEFAULT 0.95,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_medical_memory_user_id ON medical_memory(user_id);
CREATE INDEX IF NOT EXISTS idx_medical_memory_created_at ON medical_memory(created_at DESC);

ALTER TABLE medical_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own medical memories"
  ON medical_memory
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own medical memories"
  ON medical_memory
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());