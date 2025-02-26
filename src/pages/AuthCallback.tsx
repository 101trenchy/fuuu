import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { handleTwitterCallback } from '../lib/twitter';

const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    
    if (!code || !state) {
      setError('Invalid authorization response');
      return;
    }

    handleTwitterCallback(code, state)
      .then(success => {
        if (success) {
          navigate('/profile');
        } else {
          setError('Failed to authenticate with Twitter');
        }
      })
      .catch(err => {
        setError(err.message);
        console.error('Authentication error:', err);
      });
  }, [searchParams, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-[#ffe5e5] flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Authentication Error</h1>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-6 bg-[#ff7676] text-white px-6 py-2 rounded-lg hover:bg-[#ff6262] transition-all"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#ffe5e5] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#ff7676] border-t-transparent"></div>
    </div>
  );
};

export default AuthCallback