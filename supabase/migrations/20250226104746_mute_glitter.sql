/*
  # Twitter OAuth Integration Setup

  1. New Tables
    - `twitter_auth_tokens`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `access_token` (text)
      - `refresh_token` (text)
      - `expires_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `twitter_auth_tokens` table
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS twitter_auth_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  access_token text NOT NULL,
  refresh_token text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE twitter_auth_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own tokens"
  ON twitter_auth_tokens
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own tokens"
  ON twitter_auth_tokens
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can insert own tokens"
  ON twitter_auth_tokens
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create trigger for updated_at
CREATE TRIGGER update_twitter_auth_tokens_updated_at
  BEFORE UPDATE ON twitter_auth_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();