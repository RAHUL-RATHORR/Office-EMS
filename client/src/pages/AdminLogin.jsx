import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, ArrowRight } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.user.role !== 'admin') {
        return setError('Access Denied: Only Admins can login here');
      }
      login(res.data.token, 'admin');
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={{ 
      display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh',
      background: 'linear-gradient(135deg, #1e1b4b 0%, #020617 100%)'
    }}>
      <div className="glass-card animate-fade-in" style={{ 
        width: '100%', maxWidth: '400px', padding: '40px', border: '1px solid #818cf833'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ 
            width: '80px', height: '80px', background: '#818cf822', borderRadius: '20px', 
            display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px',
            border: '1px solid #818cf844'
          }}>
            <ShieldCheck size={40} color="#818cf8" />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800' }}>Admin Portal</h2>
          <p style={{ color: 'var(--text-muted)' }}>Secure access for management</p>
        </div>
        
        {error && <p style={{ color: '#f87171', marginBottom: '16px', textAlign: 'center' }}>{error}</p>}
        
        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Admin Email</label>
          <input 
            type="email" className="input-field" placeholder="admin@company.com"
            value={email} onChange={(e) => setEmail(e.target.value)} required
          />
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', marginTop: '20px' }}>Password</label>
          <input 
            type="password" className="input-field" placeholder="••••••••"
            value={password} onChange={(e) => setPassword(e.target.value)} required
          />
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '30px', background: '#818cf8', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
            Login to Admin Panel <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
