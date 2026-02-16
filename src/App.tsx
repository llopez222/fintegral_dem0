import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { UserProvider, useUser } from '@/context/UserContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ImpersonationBanner } from '@/components/ImpersonationBanner';
import { Landing } from '@/pages/Landing';
import { Login } from '@/pages/Login';
import { Signup } from '@/pages/Signup';
import { ForgotPassword } from '@/pages/ForgotPassword';
import { ResetPassword } from '@/pages/ResetPassword';
// Admin and Profile pages are loaded via MainApp component
import { MainApp } from '@/components/MainApp';
import './App.css';

// Wrapper component to handle landing page logic
function LandingRoute() {
  const { isAuthenticated } = useUser();
  const location = useLocation();
  
  // If user is authenticated and tries to access landing, redirect to pipeline
  // But allow if they came from a logout or specific navigation
  if (isAuthenticated && location.pathname === '/') {
    return <Navigate to="/pipeline" replace />;
  }
  
  return <Landing />;
}

function AppRoutes() {
  return (
    <>
      <ImpersonationBanner />
      <div className="app-container">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingRoute />} />
          <Route 
            path="/login" 
            element={
              <ProtectedRoute requireAuth={false}>
                <Login />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/signup" 
            element={
              <ProtectedRoute requireAuth={false}>
                <Signup />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/forgot-password" 
            element={
              <ProtectedRoute requireAuth={false}>
                <ForgotPassword />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reset-password/:token" 
            element={
              <ProtectedRoute requireAuth={false}>
                <ResetPassword />
              </ProtectedRoute>
            } 
          />
          
          {/* Protected App Routes */}
          <Route 
            path="/pipeline" 
            element={
              <ProtectedRoute requireAuth={true}>
                <MainApp initialView="pipeline" />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/tasks" 
            element={
              <ProtectedRoute requireAuth={true}>
                <MainApp initialView="tasks" />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/ai-goals" 
            element={
              <ProtectedRoute requireAuth={true}>
                <MainApp initialView="ai-goals" />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute requireAuth={true} requirePermission="viewAnalytics">
                <MainApp initialView="analytics" />
              </ProtectedRoute>
            } 
          />
          
          {/* Profile - accessible to all authenticated users */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute requireAuth={true}>
                <MainApp initialView="profile" />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin Routes */}
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute requireAuth={true} requirePermission="manageUsers">
                <MainApp initialView="admin-users" />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/settings" 
            element={
              <ProtectedRoute requireAuth={true} requirePermission="systemSettings">
                <MainApp initialView="admin-settings" />
              </ProtectedRoute>
            } 
          />
          
          {/* Catch all - redirect to landing or pipeline */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Toaster position="top-right" />
    </>
  );
}

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
