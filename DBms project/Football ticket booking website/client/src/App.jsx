// ─── Main App with Global Error Boundary ───
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AdminLayout from './components/AdminLayout';
import UserLayout from './components/UserLayout';
import { useAuth } from './context/AuthContext';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import MatchesList from './pages/MatchesList';
import MatchDetail from './pages/MatchDetail';
import SeatSelection from './pages/SeatSelection';
import Checkout from './pages/Checkout';
import Confirmation from './pages/Confirmation';
import MyTickets from './pages/MyTickets';
import Profile from './pages/Profile';

import AdminDashboard from './pages/AdminDashboard';
import AdminActivity from './pages/AdminActivity';
import AdminUsers from './pages/AdminUsers';
import AdminReports from './pages/AdminReports';
import ManageMatches from './pages/ManageMatches';
import ManageTeams from './pages/ManageTeams';
import ManageStadiums from './pages/ManageStadiums';
import AdminDatabasePanel from './pages/AdminDatabasePanel';
import AdminSearch from './pages/AdminSearch';
import AdminSQLConsole from './pages/AdminSQLConsole';

// ──────────────────────────────────────────────────
// Global Error Boundary: catches ANY render crash
// ──────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('React Error Boundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0d0d1a',
          color: 'white',
          flexDirection: 'column',
          gap: '1.5rem',
          padding: '2rem',
          fontFamily: 'Inter, sans-serif'
        }}>
          <div style={{ fontSize: '4rem' }}>⚠️</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>Something went wrong</h2>
          <p style={{ color: '#a1a1aa', margin: 0, textAlign: 'center', maxWidth: '400px' }}>
            {this.state.error?.message || 'An unexpected error occurred. The error has been logged.'}
          </p>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/'; }}
            style={{
              padding: '0.75rem 2rem',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem'
            }}
          >
            🏠 Go to Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ──────────────────────────────────────────────────
// Protected Route wrappers
// ──────────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  if (!user || user.role !== 'admin') return <Navigate to="/login" replace />;
  return children;
}

// ──────────────────────────────────────────────────
// App Routes — split by role
// ──────────────────────────────────────────────────
function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0d0d1a',
        color: '#a1a1aa',
        flexDirection: 'column',
        gap: '1rem',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{ fontSize: '3rem' }}>⚽</div>
        <p>Loading GoalBooker...</p>
      </div>
    );
  }

  if (user && user.role === 'admin') {
    return (
      <Routes>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route path="/admin" element={<AdminRoute><ErrorBoundary><AdminDashboard /></ErrorBoundary></AdminRoute>} />
          <Route path="/admin/activity" element={<AdminRoute><ErrorBoundary><AdminActivity /></ErrorBoundary></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><ErrorBoundary><AdminUsers /></ErrorBoundary></AdminRoute>} />
          <Route path="/admin/reports" element={<AdminRoute><ErrorBoundary><AdminReports /></ErrorBoundary></AdminRoute>} />
          <Route path="/admin/matches" element={<AdminRoute><ErrorBoundary><ManageMatches /></ErrorBoundary></AdminRoute>} />
          <Route path="/admin/teams" element={<AdminRoute><ErrorBoundary><ManageTeams /></ErrorBoundary></AdminRoute>} />
          <Route path="/admin/stadiums" element={<AdminRoute><ErrorBoundary><ManageStadiums /></ErrorBoundary></AdminRoute>} />
          <Route path="/admin/database" element={<AdminRoute><ErrorBoundary><AdminDatabasePanel /></ErrorBoundary></AdminRoute>} />
          <Route path="/admin/search" element={<AdminRoute><ErrorBoundary><AdminSearch /></ErrorBoundary></AdminRoute>} />
          <Route path="/admin/sql-console" element={<AdminRoute><ErrorBoundary><AdminSQLConsole /></ErrorBoundary></AdminRoute>} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<UserLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={user ? <Navigate to="/matches" replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/matches" replace /> : <Register />} />
        <Route path="/matches" element={<ErrorBoundary><MatchesList /></ErrorBoundary>} />
        <Route path="/matches/:id" element={<ErrorBoundary><MatchDetail /></ErrorBoundary>} />
        <Route path="/matches/:id/seats" element={<ProtectedRoute><ErrorBoundary><SeatSelection /></ErrorBoundary></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><ErrorBoundary><Checkout /></ErrorBoundary></ProtectedRoute>} />
        <Route path="/confirmation" element={<ProtectedRoute><ErrorBoundary><Confirmation /></ErrorBoundary></ProtectedRoute>} />
        <Route path="/my-tickets" element={<ProtectedRoute><ErrorBoundary><MyTickets /></ErrorBoundary></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ErrorBoundary><Profile /></ErrorBoundary></ProtectedRoute>} />
        <Route path="/dashboard" element={<Navigate to="/matches" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

// ──────────────────────────────────────────────────
// Root App — wrapped with top-level ErrorBoundary
// ──────────────────────────────────────────────────
export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
