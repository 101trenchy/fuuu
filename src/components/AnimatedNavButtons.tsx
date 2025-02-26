import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Check, ShoppingBag, LogIn, AlertCircle } from 'lucide-react';
import { useSpring, animated, config } from '@react-spring/web';
import { LoadingText } from './LoadingText';
import { XLogo } from './XLogo';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AnimatedNavButtonProps {
  children: React.ReactNode;
  delay: number;
  onClick: () => void;
  isPrimary?: boolean;
}

const AnimatedNavButton: React.FC<AnimatedNavButtonProps> = ({ children, delay, onClick, isPrimary = false }) => {
  const springProps = useSpring({
    from: { 
      opacity: 0,
      transform: 'translateY(20px)'
    },
    to: { 
      opacity: 1,
      transform: 'translateY(0px)'
    },
    delay,
    config: { ...config.easeOut, duration: 500 }
  });

  const glowSpring = useSpring({
    from: { textShadow: '0 0 0px rgba(255,118,118,0)' },
    to: async (next) => {
      while (true) {
        await next({ textShadow: '0 0 20px rgba(255,118,118,0.6)' });
        await next({ textShadow: '0 0 5px rgba(255,118,118,0.2)' });
      }
    },
    config: { duration: 2000 },
    pause: !isPrimary
  });

  return (
    <animated.div
      style={springProps}
      className="flex items-center gap-2 pointer-events-auto cursor-pointer transition-colors"
    >
      <animated.div
        style={isPrimary ? glowSpring : undefined}
        onClick={onClick}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg shadow-md transition-colors duration-200
          ${isPrimary 
            ? 'bg-[#ff7676] hover:bg-[#ff6262] text-white'
            : 'bg-white hover:bg-gray-50'
          }
        `}
      >
        {children}
      </animated.div>
    </animated.div>
  );
};

export const AnimatedNavButtons: React.FC<{
  contractAddress: string;
  copied: boolean;
  onCopy: () => void;
}> = ({ contractAddress, copied, onCopy }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Get initial auth state
    const getInitialUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getInitialUser();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const openMerch = () => {
    navigate('/merch');
  };

  const openXProfile = () => {
    window.open('https://x.com/FUUUCoin', '_blank');
  };

  const handleXLogin = async () => {
    try {
      setAuthError(null);
      
      // Get the current origin for the redirect
      const currentOrigin = window.location.origin;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'twitter',
        options: {
          redirectTo: currentOrigin,
          skipBrowserRedirect: false
        }
      });
      
      if (error) {
        if (error.message.includes('provider is not enabled')) {
          setAuthError('X/Twitter login is currently unavailable. Please try again later.');
        } else {
          setAuthError('Failed to login. Please try again.');
        }
        console.error('Error logging in with X:', error);
      }
    } catch (error) {
      setAuthError('An unexpected error occurred. Please try again.');
      console.error('Error logging in with X:', error);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="relative">
      <div className="flex gap-3">
        <AnimatedNavButton delay={200} onClick={onCopy} isPrimary={true}>
          <LoadingText />
          {copied ? (
            <Check className="w-4 h-4 text-white" />
          ) : (
            <Copy className="w-4 h-4 text-white" />
          )}
        </AnimatedNavButton>

        <AnimatedNavButton delay={400} onClick={user ? handleLogout : handleXLogin}>
          {user ? (
            <div className="flex items-center gap-2">
              <img
                src={user.user_metadata.avatar_url}
                alt={user.user_metadata.user_name}
                className="w-6 h-6 rounded-full"
              />
              <span className="font-mono text-gray-700">
                @{user.user_metadata.user_name}
              </span>
            </div>
          ) : (
            <>
              <span className="font-mono text-gray-700">Login with</span>
              <XLogo className="w-4 h-4 text-gray-700" />
            </>
          )}
        </AnimatedNavButton>

        <AnimatedNavButton delay={600} onClick={openXProfile}>
          <span className="font-mono text-gray-700">Follow on</span>
          <XLogo className="w-4 h-4 text-gray-700" />
        </AnimatedNavButton>

        <AnimatedNavButton delay={800} onClick={openMerch}>
          <span className="font-mono text-gray-700">Merch</span>
          <ShoppingBag className="w-4 h-4 text-gray-700" />
        </AnimatedNavButton>
      </div>

      {authError && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 bg-red-50 text-red-600 px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{authError}</span>
        </div>
      )}
    </div>
  );
};