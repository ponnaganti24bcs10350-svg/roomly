import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ToastAlert } from './components/ToastAlert';
import { HomePage } from './pages/HomePage';
import { PropertiesPage } from './pages/PropertiesPage';
import { PropertyDetailPage } from './pages/PropertyDetailPage';
import { RoommatesPage } from './pages/RoommatesPage';
import { ComparePage } from './pages/ComparePage';
import { FinancialCalculatorPage } from './pages/FinancialCalculatorPage';
import { ChatPage } from './pages/ChatPage';
import { VisitsPage } from './pages/VisitsPage';
import { TenantDashboardPage } from './pages/TenantDashboardPage';
import { LandlordDashboardPage } from './pages/LandlordDashboardPage';
import { AddPropertyPage } from './pages/AddPropertyPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { useAuth } from './context/AuthContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Navbar />
      <ToastAlert />

      <div className="flex-1">
        <Routes>

          <Route path="/" element={<HomePage />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/properties/:id" element={<PropertyDetailPage />} />
          <Route path="/roommates" element={<RoommatesPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/calculator" element={<FinancialCalculatorPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/visits"
            element={
              <ProtectedRoute>
                <VisitsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/tenant"
            element={
              <ProtectedRoute allowedRoles={['TENANT', 'ADMIN']}>
                <TenantDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/landlord"
            element={
              <ProtectedRoute allowedRoles={['LANDLORD', 'ADMIN']}>
                <LandlordDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/landlord/new"
            element={
              <ProtectedRoute allowedRoles={['LANDLORD', 'ADMIN']}>
                <AddPropertyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
};
