/*
  # Add post_count column to profiles table

  1. Changes
    - Add post_count column to profiles table with default value of 0
    - Add index on post_count for faster leaderboard queries

  2. Security
    - No changes to RLS policies needed
*/

-- Add post_count column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'post_count'
  ) THEN
    ALTER TABLE profiles ADD COLUMN post_count integer DEFAULT 0;
  END IF;
END $$;

-- Create index for faster leaderboard queries
CREATE INDEX IF NOT EXISTS profiles_post_count_idx ON profiles (post_count DESC);