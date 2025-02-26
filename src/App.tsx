import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MerchPage from './pages/MerchPage';
import { supabase } from './lib/supabase';

function App() {
  // Handle auth state on app initialization
  useEffect(() => {
    const handleAuthChanges = async () => {
      try {
        // Get the hash from the URL
        const hash = window.location.hash;
        
        // If there's a hash, it might be an auth callback
        if (hash && hash.includes('access_token')) {
          // Handle the hash manually instead of relying on auto-detection
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Error processing auth callback:', error);
          } else if (data?.session) {
            console.log('User authenticated successfully');
            // Clear the hash to prevent issues on refresh
            window.history.replaceState(null, '', window.location.pathname);
          }
        } else {
          // Just get the session without processing any hash
          const { error } = await supabase.auth.getSession();
          if (error) {
            console.error('Error getting auth session:', error);
          }
        }
      } catch (err) {
        console.error('Failed to handle auth:', err);
      }
    };
    
    handleAuthChanges();
    
    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session ? 'User logged in' : 'User logged out');
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/merch" element={<MerchPage />} />
      </Routes>
    </Router>
  );
}

export default App;