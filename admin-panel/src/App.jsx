import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminManagement from './pages/AdminManagement';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="auth-wrapper">
        <div className="loader loader-dark"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={!session ? <Login /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/" 
          element={session ? <Dashboard session={session} /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/admins" 
          element={session ? <AdminManagement /> : <Navigate to="/login" replace />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
