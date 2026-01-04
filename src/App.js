import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Components
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import IdleTimer from './components/IdleTimer'; // ✅ IMPORT IDLE TIMER
import NotFound from './pages/NotFound';         // ✅ IMPORT 404 PAGE

// Lazy Load Dashboards
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const StaffDashboard = lazy(() => import('./pages/StaffDashboard'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const PageLoader = () => (
  <div style={{ height: '100vh', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#666' }}>
    Please wait...
  </div>
);

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          {/* ✅ Activate Idle Timer inside AuthProvider so it can access 'user' state */}
          <IdleTimer />

          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              <Route path="/admin-dashboard" element={
                <PrivateRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </PrivateRoute>
              } />

              <Route path="/staff-dashboard" element={
                <PrivateRoute allowedRoles={['staff', 'admin']}>
                  <StaffDashboard />
                </PrivateRoute>
              } />

              <Route path="/student-dashboard" element={
                <PrivateRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </PrivateRoute>
              } />

              {/* ✅ CATCH-ALL 404 ROUTE (Must be the last route) */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Router>
        <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;