import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, ArrowRight } from 'lucide-react';

const EmployeeLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.user.role !== 'employee') {
        return setError('Access Denied: Only Employees can login here');
      }
      login(res.data.token, 'employee');
      navigate('/employee/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={{ 
      display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh',
      background: 'linear-gradient(135deg, #064e3b 0%, #020617 100%)'
    }}>
      <div className="glass-card animate-fade-in" style={{ 
        width: '100%', maxWidth: '400px', padding: '40px', border: '1px solid #10b98133'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ 
            width: '80px', height: '80px', background: '#10b98122', borderRadius: '20px', 
            display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px',
            border: '1px solid #10b98144'
          }}>
            <User size={40} color="#10b981" />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800' }}>Employee Login</h2>
          <p style={{ color: 'var(--text-muted)' }}>Access your work dashboard</p>
        </div>
        
        {error && <p style={{ color: '#f87171', marginBottom: '16px', textAlign: 'center' }}>{error}</p>}
        
        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Email Address</label>
          <input 
            type="email" className="input-field" placeholder="name@company.com"
            value={email} onChange={(e) => setEmail(e.target.value)} required
          />
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', marginTop: '20px' }}>Password</label>
          <input 
            type="password" className="input-field" placeholder="••••••••"
            value={password} onChange={(e) => setPassword(e.target.value)} required
          />
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '30px', background: '#10b981', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
            Sign In <ArrowRight size={18} />
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          New employee? <Link to="/signup" style={{ color: '#10b981', fontWeight: 'bold', textDecoration: 'none' }}>Create an account</Link>
        </p>
      </div>
    </div>
  );
};

export default EmployeeLogin;
