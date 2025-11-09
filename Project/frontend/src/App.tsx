import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import BusinessPage from './pages/BusinessPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CustomerDashboard from './pages/CustomerDashboard';
import CustomerAppointments from './pages/CustomerAppointments';
import CustomerProfile from './pages/CustomerProfile';
import BusinessDashboard from './pages/BusinessDashboard';
import BusinessProfile from './pages/BusinessProfile';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/business/:id" element={<BusinessPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedUserTypes={['customer']}>
                <CustomerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/appointments" 
            element={
              <ProtectedRoute allowedUserTypes={['customer']}>
                <CustomerAppointments />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute allowedUserTypes={['customer']}>
                <CustomerProfile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/business/dashboard" 
            element={
              <ProtectedRoute allowedUserTypes={['business']}>
                <BusinessDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/business/profile" 
            element={
              <ProtectedRoute allowedUserTypes={['business']}>
                <BusinessProfile />
              </ProtectedRoute>
            } 
          />
        </Routes>
        <Toaster position="bottom-right" richColors />
      </Router>
    </AuthProvider>
  );
}

export default App;
