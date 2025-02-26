import React, { useEffect, useState } from 'react';
import { Trophy, ArrowUp, Users } from 'lucide-react';
import { useSpring, animated } from '@react-spring/web';
import { supabase } from '../lib/supabase';
import type { Profile } from '../lib/database.types';

export const Leaderboard = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('post_count', { ascending: false })
        .limit(100);

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setError('Failed to load leaderboard data');
    } finally {
      setLoading(false);
    }
  };

  const springProps = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    config: { tension: 280, friction: 20 }
  });

  return (
    <animated.div 
      style={springProps}
      className="bg-white rounded-xl shadow-lg p-6 max-w-2xl w-full mx-auto"
    >
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-6 h-6 text-[#ff7676]" />
        <h2 className="text-2xl font-bold">$FUUU Leaderboard</h2>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff7676]" />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">
          <p>{error}</p>
          <button 
            onClick={fetchLeaderboard}
            className="mt-4 text-sm text-[#ff7676] hover:text-[#ff6262] transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : profiles.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No posts yet. Be the first to post with #$FUUU!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {profiles.map((profile, index) => (
            <div
              key={profile.id}
              className={`
                flex items-center gap-4 p-4 rounded-lg transition-all
                ${index === 0 ? 'bg-[#fff5f5]' : 'hover:bg-gray-50'}
              `}
            >
              <div className="w-8 text-center font-bold text-gray-500">
                {index + 1}
              </div>
              
              <img
                src={profile.avatar_url || 'https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png'}
                alt={profile.username}
                className="w-10 h-10 rounded-full"
              />
              
              <div className="flex-1">
                <a
                  href={`https://x.com/${profile.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-gray-900 hover:text-[#ff7676] transition-colors"
                >
                  @{profile.username}
                </a>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{profile.post_count} posts</span>
                  {profile.last_post_at && (
                    <span title={new Date(profile.last_post_at).toLocaleString()}>
                      • Last post {formatTimeAgo(profile.last_post_at)}
                    </span>
                  )}
                </div>
              </div>

              {index < 3 && (
                <div className="flex items-center gap-1 text-[#ff7676] font-medium">
                  <ArrowUp className="w-4 h-4" />
                  Top {index + 1}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </animated.div>
  );
};

function formatTimeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + 'y ago';
  
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + 'mo ago';
  
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + 'd ago';
  
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + 'h ago';
  
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + 'm ago';
  
  return Math.floor(seconds) + 's ago';
}