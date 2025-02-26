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
        // This will handle the auth redirect and session management
        const { error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting auth session:', error);
        }
      } catch (err) {
        console.error('Failed to get auth session:', err);
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