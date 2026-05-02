import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { UserPlus, Mail, Lock, User, Briefcase, ArrowRight, CheckCircle } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      // Note: We need to update the backend to allow public employee registration
      await api.post('/auth/register-public', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'employee'
      });
      setSuccess(true);
      setTimeout(() => navigate('/'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  if (success) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0fdf4' }}>
        <div className="glass-card animate-fade-in" style={{ textAlign: 'center', maxWidth: '400px', padding: '40px' }}>
          <div style={{ width: '80px', height: '80px', background: '#10b981', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 24px' }}>
            <CheckCircle size={48} color="white" />
          </div>
          <h2 style={{ color: '#064e3b', marginBottom: '12px' }}>Registration Successful!</h2>
          <p style={{ color: '#065f46', marginBottom: '24px' }}>Welcome to the team! Redirecting you to login...</p>
          <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      padding: '20px'
    }}>
      <div className="glass-card animate-fade-in" style={{ 
        width: '100%', 
        maxWidth: '500px',
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '40px',
        borderRadius: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            background: '#10b98115', 
            borderRadius: '16px', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            margin: '0 auto 16px'
          }}>
            <UserPlus size={32} color="#10b981" />
          </div>
          <h2 style={{ color: '#1f2937', fontSize: '1.8rem', fontWeight: '800' }}>Join EMS Portal</h2>
          <p style={{ color: '#6b7280' }}>Create your employee account to get started</p>
        </div>

        {error && (
          <div style={{ 
            background: '#fef2f2', color: '#dc2626', padding: '12px', 
            borderRadius: '12px', marginBottom: '20px', fontSize: '0.9rem',
            textAlign: 'center', border: '1px solid #fecaca'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.9rem', color: '#374151', fontWeight: '600' }}>
              <User size={16} /> Full Name
            </label>
            <input 
              name="name" type="text" className="input-field" placeholder="John Doe"
              value={formData.name} onChange={handleChange}
              style={{ background: '#f9fafb', color: '#1f2937', border: '1px solid #e5e7eb' }}
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.9rem', color: '#374151', fontWeight: '600' }}>
              <Mail size={16} /> Email Address
            </label>
            <input 
              name="email" type="email" className="input-field" placeholder="john@company.com"
              value={formData.email} onChange={handleChange}
              style={{ background: '#f9fafb', color: '#1f2937', border: '1px solid #e5e7eb' }}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.9rem', color: '#374151', fontWeight: '600' }}>
                <Lock size={16} /> Password
              </label>
              <input 
                name="password" type="password" className="input-field" placeholder="••••••••"
                value={formData.password} onChange={handleChange}
                style={{ background: '#f9fafb', color: '#1f2937', border: '1px solid #e5e7eb' }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.9rem', color: '#374151', fontWeight: '600' }}>
                <Lock size={16} /> Confirm
              </label>
              <input 
                name="confirmPassword" type="password" className="input-field" placeholder="••••••••"
                value={formData.confirmPassword} onChange={handleChange}
                style={{ background: '#f9fafb', color: '#1f2937', border: '1px solid #e5e7eb' }}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ 
            width: '100%', background: '#10b981', padding: '14px', borderRadius: '12px',
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px',
            fontSize: '1rem', fontWeight: 'bold'
          }}>
            Create Account <ArrowRight size={18} />
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', color: '#6b7280', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/" style={{ color: '#10b981', fontWeight: 'bold', textDecoration: 'none' }}>Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
