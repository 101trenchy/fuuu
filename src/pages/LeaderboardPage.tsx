import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Clock, Hash, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '../lib/supabase';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface LeaderboardEntry {
  username: string;
  tweet_count: number;
  latest_tweet: string;
  tweets_24h: number;
}

interface TweetTrend {
  time: string;
  count: number;
}

const LeaderboardPage = () => {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [trendData, setTrendData] = useState<TweetTrend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data, error } = await supabase
          .from('leaderboard')
          .select('*')
          .order('tweet_count', { ascending: false });

        if (error) throw error;
        setLeaderboard(data || []);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      }
    };

    const fetchTrendData = async () => {
      try {
        const { data, error } = await supabase
          .from('tweets')
          .select('posted_at')
          .gte('posted_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .order('posted_at', { ascending: true });

        if (error) throw error;

        // Group tweets by hour
        const hourlyData = data.reduce((acc: Record<string, number>, tweet) => {
          const hour = new Date(tweet.posted_at).getHours();
          acc[hour] = (acc[hour] || 0) + 1;
          return acc;
        }, {});

        const trends = Object.entries(hourlyData).map(([hour, count]) => ({
          time: `${hour}:00`,
          count,
        }));

        setTrendData(trends);
      } catch (error) {
        console.error('Error fetching trend data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
    fetchTrendData();

    // Set up real-time subscription
    const subscription = supabase
      .channel('leaderboard_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tweets' }, () => {
        fetchLeaderboard();
        fetchTrendData();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-[#ffe5e5] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#ff7676] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#ffe5e5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-all transform hover:scale-105 active:scale-95 mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Home</span>
        </button>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-[#ff7676]" />
            #$FUUU Leaderboard
          </h2>

          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#ff7676]" />
              24-Hour Tweet Activity
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#ff7676"
                    strokeWidth={2}
                    dot={{ fill: '#ff7676' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-4 text-left">Rank</th>
                  <th className="py-3 px-4 text-left">Username</th>
                  <th className="py-3 px-4 text-left">
                    <div className="flex items-center gap-1">
                      <Hash className="w-4 h-4" />
                      Total Tweets
                    </div>
                  </th>
                  <th className="py-3 px-4 text-left">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Last 24h
                    </div>
                  </th>
                  <th className="py-3 px-4 text-left">Latest Tweet</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, index) => (
                  <tr
                    key={entry.username}
                    className={`
                      border-b last:border-b-0
                      ${index < 3 ? 'bg-[#fff5f5]' : ''}
                    `}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {index < 3 && (
                          <Trophy
                            className={`w-5 h-5 ${
                              index === 0
                                ? 'text-yellow-500'
                                : index === 1
                                ? 'text-gray-400'
                                : 'text-amber-600'
                            }`}
                          />
                        )}
                        <span className="font-medium">#{index + 1}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium">{entry.username}</td>
                    <td className="py-3 px-4">{entry.tweet_count}</td>
                    <td className="py-3 px-4">{entry.tweets_24h}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {formatDistanceToNow(new Date(entry.latest_tweet), {
                        addSuffix: true,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;