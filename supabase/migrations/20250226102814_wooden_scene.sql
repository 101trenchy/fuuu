/*
  # Social Media Tracking System Schema

  1. New Tables
    - `twitter_users`
      - `id` (uuid, primary key)
      - `user_id` (text, Twitter/X user ID)
      - `username` (text)
      - `auth_id` (uuid, references auth.users)
      - `tweet_goal` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `tweets`
      - `id` (uuid, primary key)
      - `tweet_id` (text, Twitter/X tweet ID)
      - `user_id` (uuid, references twitter_users)
      - `content` (text)
      - `posted_at` (timestamp)
      - `created_at` (timestamp)
    
    - `milestones`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references twitter_users)
      - `tweet_count` (integer)
      - `achieved_at` (timestamp)
      - `notified` (boolean)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to:
      - Read their own data
      - Update their own goals
      - View public leaderboard data
*/

-- Create twitter_users table
CREATE TABLE IF NOT EXISTS twitter_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text UNIQUE NOT NULL,
  username text NOT NULL,
  auth_id uuid REFERENCES auth.users NOT NULL,
  tweet_goal integer DEFAULT 100,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tweets table
CREATE TABLE IF NOT EXISTS tweets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tweet_id text UNIQUE NOT NULL,
  user_id uuid REFERENCES twitter_users NOT NULL,
  content text NOT NULL,
  posted_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create milestones table
CREATE TABLE IF NOT EXISTS milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES twitter_users NOT NULL,
  tweet_count integer NOT NULL,
  achieved_at timestamptz DEFAULT now(),
  notified boolean DEFAULT false
);

-- Enable RLS
ALTER TABLE twitter_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tweets ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

-- Policies for twitter_users
CREATE POLICY "Users can read own data"
  ON twitter_users
  FOR SELECT
  TO authenticated
  USING (auth_id = auth.uid());

CREATE POLICY "Users can update own goals"
  ON twitter_users
  FOR UPDATE
  TO authenticated
  USING (auth_id = auth.uid())
  WITH CHECK (auth_id = auth.uid());

-- Policies for tweets
CREATE POLICY "Users can read all tweets"
  ON tweets
  FOR SELECT
  TO authenticated
  USING (true);

-- Policies for milestones
CREATE POLICY "Users can read own milestones"
  ON milestones
  FOR SELECT
  TO authenticated
  USING (user_id IN (
    SELECT id FROM twitter_users WHERE auth_id = auth.uid()
  ));

-- Create function to update user's updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_twitter_users_updated_at
  BEFORE UPDATE ON twitter_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create view for leaderboard
CREATE OR REPLACE VIEW leaderboard AS
SELECT 
  tu.username,
  COUNT(t.id) as tweet_count,
  MAX(t.posted_at) as latest_tweet,
  COUNT(t.id) FILTER (
    WHERE t.posted_at > now() - interval '24 hours'
  ) as tweets_24h
FROM twitter_users tu
LEFT JOIN tweets t ON t.user_id = tu.id
GROUP BY tu.id, tu.username
ORDER BY tweet_count DESC;

-- Grant access to the view
GRANT SELECT ON leaderboard TO authenticated;