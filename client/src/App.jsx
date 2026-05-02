import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminLogin from './pages/AdminLogin';
import EmployeeLogin from './pages/EmployeeLogin';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';

const ProtectedRoute = ({ children, role }) => {
  const { adminUser, employeeUser, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  
  const currentUser = role === 'admin' ? adminUser : employeeUser;

  if (!currentUser) {
    return <Navigate to={role === 'admin' ? '/admin' : '/employee'} />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/employee" />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/employee" element={<EmployeeLogin />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route 
            path="/admin/dashboard/*" 
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/employee/dashboard/*" 
            element={
              <ProtectedRoute role="employee">
                <EmployeeDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
