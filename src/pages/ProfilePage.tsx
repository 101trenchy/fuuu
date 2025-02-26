import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, Bell, History, Award, Twitter, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '../lib/supabase';
import { initiateTwitterAuth, refreshTweets } from '../lib/twitter';

interface Tweet {
  id: string;
  content: string;
  posted_at: string;
}

interface UserProfile {
  username: string;
  tweet_goal: number;
  tweet_count: number;
}

interface Milestone {
  tweet_count: number;
  achieved_at: string;
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editingGoal, setEditingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from('twitter_users')
        .select('username, tweet_goal')
        .eq('auth_id', user.id)
        .single();

      if (!profileData) return;

      const { data: tweetsData } = await supabase
        .from('tweets')
        .select('id, content, posted_at')
        .eq('user_id', profileData.id)
        .order('posted_at', { ascending: false });

      const { data: milestonesData } = await supabase
        .from('milestones')
        .select('tweet_count, achieved_at')
        .eq('user_id', profileData.id)
        .order('achieved_at', { ascending: false });

      setProfile({
        ...profileData,
        tweet_count: tweetsData?.length || 0
      });
      setTweets(tweetsData || []);
      setMilestones(milestonesData || []);
      setNewGoal(profileData.tweet_goal);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: tokens } = await supabase
        .from('twitter_auth_tokens')
        .select('access_token')
        .eq('user_id', user.id)
        .single();

      setIsAuthenticated(!!tokens);
      if (tokens) {
        await fetchUserData();
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshTweets();
    await fetchUserData();
    setRefreshing(false);
  };

  const updateGoal = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('twitter_users')
        .update({ tweet_goal: newGoal })
        .eq('auth_id', user.id);

      setProfile(prev => prev ? { ...prev, tweet_goal: newGoal } : null);
      setEditingGoal(false);
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-[#ffe5e5] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#ff7676] border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-[#ffe5e5] flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <h1 className="text-2xl font-bold mb-6">Connect Your Twitter Account</h1>
          <p className="text-gray-600 mb-8">
            To track your #$FUUU tweets and participate in the leaderboard,
            please connect your Twitter account.
          </p>
          <button
            onClick={initiateTwitterAuth}
            className="flex items-center gap-2 bg-[#1DA1F2] text-white px-6 py-3 rounded-lg hover:bg-[#1a8cd8] transition-all transform hover:scale-105 active:scale-95"
          >
            <Twitter className="w-5 h-5" />
            Connect with Twitter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#ffe5e5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-all transform hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Home</span>
          </button>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="font-medium">Refresh Tweets</span>
          </button>
        </div>

        {profile && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6">{profile.username}'s Profile</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-[#ff7676]" />
                      <span className="font-medium">Tweet Goal</span>
                    </div>
                    {editingGoal ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={newGoal}
                          onChange={(e) => setNewGoal(parseInt(e.target.value))}
                          className="w-20 px-2 py-1 border rounded"
                        />
                        <button
                          onClick={updateGoal}
                          className="text-sm bg-[#ff7676] text-white px-3 py-1 rounded hover:bg-[#ff6262]"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span>{profile.tweet_goal}</span>
                        <button
                          onClick={() => setEditingGoal(true)}
                          className="text-sm text-[#ff7676] hover:text-[#ff6262]"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <History className="w-5 h-5 text-[#ff7676]" />
                      <span className="font-medium">Total #$FUUU Tweets</span>
                    </div>
                    <span>{profile.tweet_count}</span>
                  </div>

                  <div className="relative pt-4">
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-100">
                      <div
                        style={{
                          width: `${Math.min(100, (profile.tweet_count / profile.tweet_goal) * 100)}%`
                        }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#ff7676]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Award className="w-6 h-6 text-[#ff7676]" />
                  <h3 className="text-xl font-bold">Milestones</h3>
                </div>
                
                <div className="space-y-4">
                  {milestones.map((milestone) => (
                    <div
                      key={milestone.achieved_at}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-[#ff7676]" />
                        <span>{milestone.tweet_count} tweets</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {formatDistanceToNow(new Date(milestone.achieved_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-6">Tweet History</h3>
              <div className="space-y-4">
                {tweets.map((tweet) => (
                  <div
                    key={tweet.id}
                    className="p-4 border rounded-lg hover:border-[#ff7676] transition-colors"
                  >
                    <p className="text-gray-800 mb-2">{tweet.content}</p>
                    <p className="text-sm text-gray-600">
                      {formatDistanceToNow(new Date(tweet.posted_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;