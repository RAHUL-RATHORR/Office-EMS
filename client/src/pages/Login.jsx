import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LogIn, ShieldCheck, User, ArrowRight } from 'lucide-react';

const Login = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user: userData } = res.data;
      
      // Pass both token and role to login function
      login(token, userData.role);
      
      if (userData.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/employee');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const themeColor = isAdmin ? '#818cf8' : '#10b981';
  const bgColor = isAdmin ? '#1e1b4b' : '#064e3b';

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      background: `linear-gradient(135deg, ${bgColor} 0%, #020617 100%)`,
      transition: 'all 0.5s ease'
    }}>
      <div className="glass-card animate-fade-in" style={{ 
        width: '100%', 
        maxWidth: '450px',
        padding: '40px',
        border: `1px solid ${themeColor}33`,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated Background Glow */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '150px',
          height: '150px',
          background: themeColor,
          filter: 'blur(80px)',
          opacity: '0.2',
          borderRadius: '50%'
        }}></div>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            background: `${themeColor}22`, 
            borderRadius: '20px', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            margin: '0 auto 20px',
            border: `1px solid ${themeColor}44`
          }}>
            {isAdmin ? <ShieldCheck size={40} color={themeColor} /> : <User size={40} color={themeColor} />}
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '8px' }}>
            {isAdmin ? 'Admin Portal' : 'Employee Login'}
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Enter your credentials to access the dashboard
          </p>
        </div>

        {/* Role Toggle */}
        <div style={{ 
          display: 'flex', 
          background: 'rgba(255,255,255,0.05)', 
          padding: '4px', 
          borderRadius: '12px', 
          marginBottom: '30px' 
        }}>
          <button 
            onClick={() => setIsAdmin(false)}
            style={{
              flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer',
              background: !isAdmin ? themeColor : 'transparent',
              color: !isAdmin ? 'white' : 'var(--text-muted)',
              fontWeight: 'bold', transition: '0.3s'
            }}
          >
            Employee
          </button>
          <button 
            onClick={() => setIsAdmin(true)}
            style={{
              flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer',
              background: isAdmin ? themeColor : 'transparent',
              color: isAdmin ? 'white' : 'var(--text-muted)',
              fontWeight: 'bold', transition: '0.3s'
            }}
          >
            Admin
          </button>
        </div>
        
        {error && (
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.1)', 
            color: '#f87171', 
            padding: '12px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            fontSize: '0.9rem',
            textAlign: 'center',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Email Address</label>
            <input 
              type="email" 
              className="input-field" 
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ border: `1px solid ${themeColor}22` }}
              required
            />
          </div>
          
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Password</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ border: `1px solid ${themeColor}22` }}
              required
            />
          </div>
          
          <button type="submit" className="btn-primary" style={{ 
            width: '100%', 
            background: themeColor,
            padding: '14px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '10px',
            fontSize: '1rem'
          }}>
            Continue to Dashboard <ArrowRight size={18} />
          </button>
        </form>

        {!isAdmin && (
          <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            New employee? <Link to="/signup" style={{ color: themeColor, cursor: 'pointer', fontWeight: 'bold', textDecoration: 'none' }}>Create an account</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
