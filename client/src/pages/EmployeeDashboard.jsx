import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Clock, FileText, Calendar, LogOut, Play, Square, Send, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const EmployeeDashboard = () => {
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [reports, setReports] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [report, setReport] = useState('');
  const [editModal, setEditModal] = useState({ show: false, id: null, text: '' });
  const [leave, setLeave] = useState({ reason: '', start_date: '', end_date: '' });
  const [activeTab, setActiveTab] = useState('session');
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [confirmSession, setConfirmSession] = useState({ show: false, type: '' }); // 'start' or 'stop'

  const { logout, employeeUser: user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Employee Dashboard';
    fetchMyData();
    fetchMyLeaves();
    fetchMyReports();
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) return alert('Passwords do not match');
    try {
      await api.put('/auth/profile', { password: passwords.new });
      setPasswords({ current: '', new: '', confirm: '' });
      alert('Password updated successfully');
    } catch (err) {
      alert('Failed to update password');
    }
  };

  const fetchMyData = async () => {
    try {
      const attRes = await api.get('/attendance/my');
      setAttendance(attRes.data);
      const active = attRes.data.find(a => !a.logout_time);
      setActiveSession(active);
    } catch (err) {
      console.error('Error fetching employee data', err);
    }
  };

  const fetchMyLeaves = async () => {
    try {
      const res = await api.get('/leaves/my');
      setLeaves(res.data);
    } catch (err) {
      console.error('Error fetching leaves', err);
    }
  };

  const fetchMyReports = async () => {
    try {
      const res = await api.get('/reports/my');
      setReports(res.data);
    } catch (err) {
      console.error('Error fetching reports', err);
    }
  };

  const startSession = async () => {
    try {
      const res = await api.post('/attendance/start');
      if (res.data && res.data.id) {
        setActiveSession(res.data);
        fetchMyData();
      } else {
        fetchMyData();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Error starting session';
      alert(msg);
      fetchMyData();
    }
  };

  const endSession = async () => {
    try {
      await api.post('/attendance/end');
      setActiveSession(null);
      fetchMyData();
    } catch (err) {
      alert('Error ending session');
    }
  };

  const submitReport = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reports', { report_text: report });
      setReport('');
      fetchMyReports();
      alert('Report submitted successfully');
    } catch (err) {
      alert('Failed to submit report');
    }
  };

  const handleUpdateReport = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/reports/${editModal.id}`, { report_text: editModal.text });
      setEditModal({ show: false, id: null, text: '' });
      fetchMyReports();
      alert('Report updated successfully');
    } catch (err) {
      alert('Failed to update report');
    }
  };

  const applyLeave = async (e) => {
    e.preventDefault();
    try {
      await api.post('/leaves', leave);
      setLeave({ reason: '', start_date: '', end_date: '' });
      fetchMyLeaves();
      alert('Leave application submitted');
    } catch (err) {
      alert('Failed to apply for leave');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div style={{ width: '260px', background: 'var(--bg-card)', padding: '24px', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ marginBottom: '10px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Clock /> EMS
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '10px', fontSize: '0.9rem' }}>Welcome, {user?.name}</p>

        <button
          onClick={() => {
            const currentToken = localStorage.getItem('token');
            if (currentToken) {
              try {
                const payload = JSON.parse(atob(currentToken.split('.')[1]));
                navigator.clipboard.writeText(currentToken);
                alert(`Token for "${payload.name}" copied! Paste this in your desktop app.`);
              } catch (e) {
                navigator.clipboard.writeText(currentToken);
                alert('Token copied!');
              }
            } else {
              alert('No token found. Please login again.');
            }
          }}
          style={{
            fontSize: '0.7rem', padding: '5px 10px', marginBottom: '30px',
            background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)',
            border: '1px solid var(--primary)', width: '100%', cursor: 'pointer'
          }}
        >
          Copy Auth Token
        </button>

        <nav>
          {[
            { id: 'session', label: 'Work Session', icon: <Play size={20} /> },
            { id: 'history', label: 'My Attendance', icon: <Clock size={20} /> },
            { id: 'report', label: 'Daily Report', icon: <FileText size={20} /> },
            { id: 'leave', label: 'Apply Leave', icon: <Calendar size={20} /> },
            { id: 'settings', label: 'Settings', icon: <Users size={20} /> },
          ].map(item => (
            <div
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                marginBottom: '8px',
                background: activeTab === item.id ? 'var(--primary)' : 'transparent',
                color: activeTab === item.id ? 'white' : 'var(--text-muted)',
                transition: '0.3s'
              }}
            >
              {item.icon} {item.label}
            </div>
          ))}
        </nav>

        <button
          onClick={() => { logout('employee'); navigate('/employee'); }}
          style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)', background: 'transparent', border: 'none', cursor: 'pointer' }}
        >
          <LogOut size={20} /> Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <header style={{ marginBottom: '32px' }}>
          <h1 style={{ textTransform: 'capitalize' }}>{activeTab.replace('-', ' ')}</h1>
        </header>

        {activeTab === 'session' && (
          <div className="glass-card animate-fade-in" style={{ textAlign: 'center', padding: '60px' }}>
            {activeSession ? (
              <div>
                <div style={{ fontSize: '4rem', fontWeight: 'bold', marginBottom: '20px', color: 'var(--accent)' }}>
                  ACTIVE
                </div>
                <p style={{ marginBottom: '30px', color: 'var(--text-muted)' }}>Session started at {new Date(activeSession.login_time).toLocaleTimeString()}</p>
                <button onClick={() => setConfirmSession({ show: true, type: 'stop' })} className="btn-primary" style={{ background: 'var(--danger)', display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '15px 40px' }}>
                  <Square size={20} /> Stop Working
                </button>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '4rem', fontWeight: 'bold', marginBottom: '20px', color: 'var(--text-muted)' }}>
                  IDLE
                </div>
                <p style={{ marginBottom: '30px', color: 'var(--text-muted)' }}>You are not currently in a session.</p>
                <button onClick={() => setConfirmSession({ show: true, type: 'start' })} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '15px 40px' }}>
                  <Play size={20} /> Start Working
                </button>
              </div>
            )}

            <div style={{ marginTop: '60px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
              <div className="glass-card" style={{ padding: '20px' }}>
                <h4 style={{ color: 'var(--text-muted)' }}>Net Work Time</h4>
                <div style={{ fontSize: '2rem', color: 'var(--accent)' }}>
                  {activeSession ? `${(activeSession.active_minutes / 60).toFixed(2)}h` : '0.00h'}
                </div>
              </div>
              <div className="glass-card" style={{ padding: '20px' }}>
                <h4 style={{ color: 'var(--text-muted)' }}>Active Time</h4>
                <div style={{ fontSize: '2rem' }}>
                  {activeSession ? `${activeSession.active_minutes}m` : '0m'}
                </div>
              </div>
              <div className="glass-card" style={{ padding: '20px' }}>
                <h4 style={{ color: 'var(--text-muted)' }}>Idle Time</h4>
                <div style={{ fontSize: '2rem' }}>
                  {activeSession ? `${activeSession.idle_minutes}m` : '0m'}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="glass-card animate-fade-in">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '16px' }}>Date</th>
                  <th>Login</th>
                  <th>Logout</th>
                  <th>Total Hours</th>
                  <th>Active/Idle</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map(att => (
                  <tr key={att.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px' }}>{new Date(att.date).toLocaleDateString()}</td>
                    <td>{new Date(att.login_time).toLocaleTimeString()}</td>
                    <td>{att.logout_time ? new Date(att.logout_time).toLocaleTimeString() : 'Active'}</td>
                    <td>{att.total_hours || '0.00'}h</td>
                    <td>{att.active_minutes}m / {att.idle_minutes}m</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'report' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }} className="animate-fade-in">
            <div className="glass-card">
              <form onSubmit={submitReport}>
                <h3 style={{ marginBottom: '16px' }}>Submit Daily Work Report</h3>
                <textarea
                  className="input-field"
                  style={{ height: '200px', resize: 'vertical' }}
                  placeholder="What did you work on today?"
                  value={report}
                  onChange={e => setReport(e.target.value)}
                  required
                />
                <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                  <Send size={18} /> Submit Report
                </button>
              </form>
            </div>

            <div className="glass-card">
              <h3 style={{ marginBottom: '16px' }}>Report History</h3>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '12px 8px' }}>Date</th>
                      <th>Report</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map(rep => (
                      <tr key={rep.id} style={{ borderBottom: '1px solid var(--border)', fontSize: '0.9rem' }}>
                        <td style={{ padding: '12px 8px' }}>{new Date(rep.created_at).toLocaleDateString()}</td>
                        <td>{rep.report_text.substring(0, 20)}...</td>
                        <td>
                          <button
                            onClick={() => setEditModal({ show: true, id: rep.id, text: rep.report_text })}
                            style={{ color: 'var(--primary)', background: 'transparent', cursor: 'pointer', border: 'none' }}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'leave' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }} className="animate-fade-in">
            <div className="glass-card">
              <form onSubmit={applyLeave}>
                <h3 style={{ marginBottom: '16px' }}>Apply for Leave</h3>
                <label style={{ display: 'block', marginBottom: '8px' }}>Start Date</label>
                <input
                  type="date" className="input-field" required
                  value={leave.start_date} onChange={e => setLeave({ ...leave, start_date: e.target.value })}
                />
                <label style={{ display: 'block', marginBottom: '8px' }}>End Date</label>
                <input
                  type="date" className="input-field" required
                  value={leave.end_date} onChange={e => setLeave({ ...leave, end_date: e.target.value })}
                />
                <label style={{ display: 'block', marginBottom: '8px' }}>Reason</label>
                <textarea
                  className="input-field" style={{ height: '100px' }}
                  value={leave.reason} onChange={e => setLeave({ ...leave, reason: e.target.value })}
                  required
                />
                <button type="submit" className="btn-primary" style={{ width: '100%' }}>Apply Now</button>
              </form>
            </div>

            <div className="glass-card">
              <h3 style={{ marginBottom: '16px' }}>Leave Status History</h3>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '12px 8px' }}>Dates</th>
                      <th>Reason</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaves.map(l => (
                      <tr key={l.id} style={{ borderBottom: '1px solid var(--border)', fontSize: '0.9rem' }}>
                        <td style={{ padding: '12px 8px' }}>
                          {new Date(l.start_date).toLocaleDateString()}
                        </td>
                        <td>{l.reason.substring(0, 20)}...</td>
                        <td>
                          <span style={{
                            padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold',
                            background: l.status === 'approved' ? 'rgba(16, 185, 129, 0.2)' : l.status === 'rejected' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                            color: l.status === 'approved' ? 'var(--accent)' : l.status === 'rejected' ? 'var(--danger)' : 'var(--warning)'
                          }}>
                            {l.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="glass-card animate-fade-in" style={{ maxWidth: '500px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '24px' }}>Profile Settings</h2>
            <form onSubmit={handleChangePassword}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>New Password</label>
                <input
                  type="password" className="input-field" required
                  value={passwords.new} onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                />
              </div>
              <div style={{ marginBottom: '30px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Confirm New Password</label>
                <input
                  type="password" className="input-field" required
                  value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%' }}>Update Password</button>
            </form>
          </div>
        )}
      </div>

      {/* Report Edit Modal */}
      {editModal.show && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
          <div className="glass-card" style={{ width: '500px' }}>
            <h2 style={{ marginBottom: '20px' }}>Edit Work Report</h2>
            <form onSubmit={handleUpdateReport}>
              <textarea
                className="input-field"
                rows="8"
                required
                value={editModal.text}
                onChange={e => setEditModal({ ...editModal, text: e.target.value })}
                style={{ resize: 'none' }}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Update</button>
                <button type="button" onClick={() => setEditModal({ show: false, id: null, text: '' })} style={{ flex: 1, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-main)', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Session Confirmation Modal */}
      {confirmSession.show && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
          <div className="glass-card animate-fade-in" style={{ width: '400px', textAlign: 'center', padding: '40px' }}>
            <div style={{ 
              width: '80px', height: '80px', 
              background: confirmSession.type === 'start' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
              borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px' 
            }}>
              {confirmSession.type === 'start' ? <Play size={40} color="var(--accent)" /> : <Square size={35} color="var(--danger)" />}
            </div>
            <h2 style={{ marginBottom: '10px' }}>{confirmSession.type === 'start' ? 'Start Session?' : 'Stop Session?'}</h2>
            <p style={{ marginBottom: '30px', color: 'var(--text-muted)' }}>
              {confirmSession.type === 'start' 
                ? 'Are you ready to begin your work session?' 
                : 'Are you sure you want to end your current work session?'}
            </p>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button
                onClick={() => {
                  if (confirmSession.type === 'start') startSession();
                  else endSession();
                  setConfirmSession({ show: false, type: '' });
                }}
                className="btn-primary"
                style={{ flex: 1, background: confirmSession.type === 'start' ? 'var(--primary)' : 'var(--danger)' }}
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirmSession({ show: false, type: '' })}
                style={{ flex: 1, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-main)', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;
