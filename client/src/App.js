import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import SignUp from './components/SignUp';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AddAgent from './components/AddAgent';
import EditAgent from './components/EditAgent';
import AgentList from './components/AgentList';
import AgentLists from './components/AgentLists';
import UploadList from './components/UploadList';
import ListDistribution from './components/ListDistribution';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token) {
      try {
        // Verify token is still valid by making a request to the protected route
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setIsAuthenticated(true);
          setUser(userData.data);
          
          // Update stored user data if different
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            if (JSON.stringify(parsedUser) !== JSON.stringify(userData.data)) {
              localStorage.setItem('user', JSON.stringify(userData.data));
            }
          } else {
            localStorage.setItem('user', JSON.stringify(userData.data));
          }
        } else {
          // Token is invalid, clear it and redirect to login
          handleInvalidSession();
        }
      } catch (error) {
        console.error('Error verifying token:', error);
        // Clear invalid token and redirect to login
        handleInvalidSession();
      }
    } else {
      // No token found, user is not authenticated
      setIsAuthenticated(false);
      setUser(null);
    }

    setLoading(false);
  };

  const handleInvalidSession = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    
    // Show toast message only if user was previously authenticated
    if (isAuthenticated) {
      toast.error('Your session has expired. Please login again.');
    }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    // Navigate to the intended page or dashboard
    const intendedPath = location.state?.from?.pathname || '/dashboard';
    navigate(intendedPath, { replace: true });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    toast.success('You have been logged out successfully.');
    navigate('/login', { replace: true });
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <div className="ms-3">
          <p className="mb-0">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Routes>
        {/* Public Routes - Only accessible when NOT authenticated */}
        <Route 
          path="/signup"
          element={
            isAuthenticated ? 
            <Navigate to="/dashboard" replace /> : 
            <SignUp onSignUpSuccess={handleLogin} />
          }
        />
        
        <Route 
          path="/login"
          element={
            isAuthenticated ? 
            <Navigate to="/dashboard" replace /> : 
            <Login onLoginSuccess={handleLogin} />
          }
        />
        
        {/* Protected Routes - Only accessible when authenticated */}
        <Route 
          path="/dashboard"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Dashboard user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        
        <Route 
          path="/agents"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <AgentList user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        
        <Route 
          path="/agents/add"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <AddAgent user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        
        <Route 
          path="/agents/edit/:agentId"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <EditAgent user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        
        <Route 
          path="/agent-lists/:agentId"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <AgentLists user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        
        <Route 
          path="/lists/upload"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <UploadList user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        
        <Route 
          path="/lists"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <ListDistribution user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        
        {/* Default routes */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? 
            <Navigate to="/dashboard" replace /> : 
            <Navigate to="/login" replace />
          } 
        />
        
        {/* Catch all route - redirect to login if not authenticated, dashboard if authenticated */}
        <Route 
          path="*" 
          element={
            isAuthenticated ? 
            <Navigate to="/dashboard" replace /> : 
            <Navigate to="/login" replace />
          } 
        />
      </Routes>
    </>
  );
}

export default App;