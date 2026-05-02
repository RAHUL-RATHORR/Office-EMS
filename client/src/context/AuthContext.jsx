import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [employeeUser, setEmployeeUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial check for both tokens
    const adminToken = localStorage.getItem('adminToken');
    const employeeToken = localStorage.getItem('employeeToken');

    if (adminToken) {
      try {
        const decoded = jwtDecode(adminToken);
        if (decoded.role === 'admin') {
          setAdminUser(decoded);
        } else {
          localStorage.removeItem('adminToken');
        }
      } catch (err) {
        localStorage.removeItem('adminToken');
      }
    }

    if (employeeToken) {
      try {
        const decoded = jwtDecode(employeeToken);
        if (decoded.role === 'employee') {
          setEmployeeUser(decoded);
        } else {
          localStorage.removeItem('employeeToken');
        }
      } catch (err) {
        localStorage.removeItem('employeeToken');
      }
    }
    setLoading(false);
  }, []);

  const login = (token, role) => {
    if (role === 'admin') {
      localStorage.setItem('adminToken', token);
      setAdminUser(jwtDecode(token));
    } else {
      localStorage.setItem('employeeToken', token);
      setEmployeeUser(jwtDecode(token));
    }
  };

  const logout = (role) => {
    if (role === 'admin') {
      localStorage.removeItem('adminToken');
      setAdminUser(null);
    } else {
      localStorage.removeItem('employeeToken');
      setEmployeeUser(null);
    }
  };

  // Helper to get active user based on current context (role)
  const getUser = (role) => {
    return role === 'admin' ? adminUser : employeeUser;
  };

  return (
    <AuthContext.Provider value={{ 
      adminUser, 
      employeeUser, 
      login, 
      logout, 
      loading,
      getUser,
      // Backward compatibility (if needed)
      user: adminUser || employeeUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
