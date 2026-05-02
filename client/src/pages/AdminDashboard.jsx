import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, Clock, FileText, Calendar, LogOut, Plus, Trash2, Check, X, LayoutDashboard, CalendarDays, Camera, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const API_BASE_URL = 'http://localhost:5000';

const AdminDashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [activity, setActivity] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [reports, setReports] = useState([]);
  const [monthlyReport, setMonthlyReport] = useState([]);
  const [selectedEmployeeForReport, setSelectedEmployeeForReport] = useState('all');
  const [viewingFolder, setViewingFolder] = useState(null); // null means showing all folders
  const [screenshots, setScreenshots] = useState([]);
  const [attendance, setAttendance] = useState([]); // For chart
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ show: false, id: null, status: '' });
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, name: '' });
  const [newEmployee, setNewEmployee] = useState({ name: '', email: '', password: '', role: 'employee' });

  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Admin Dashboard';
    fetchData();
    const interval = setInterval(fetchActivity, 30000); // Refresh activity every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [empRes, actRes, leaveRes, reportRes, attRes, monthlyRes, ssRes] = await Promise.all([
        api.get('/employees'),
        api.get('/activity/status'),
        api.get('/leaves'),
        api.get('/reports'),
        api.get('/attendance'),
        api.get('/reports/monthly'),
        api.get('/screenshots')
      ]);
      setEmployees(empRes.data);
      setActivity(actRes.data);
      setLeaves(leaveRes.data);
      setReports(reportRes.data);
      setAttendance(attRes.data);
      setMonthlyReport(monthlyRes.data);
      setScreenshots(ssRes.data);
    } catch (err) {
      console.error('Error fetching admin data', err);
    }
  };

  const fetchActivity = async () => {
    const res = await api.get('/activity/status');
    setActivity(res.data);
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', newEmployee);
      setShowAddModal(false);
      setNewEmployee({ name: '', email: '', password: '', role: 'employee' });
      fetchData();
    } catch (err) {
      console.error('Add employee error:', err);
      alert('Failed to add employee: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteEmployee = async () => {
    if (!deleteModal.id) return;
    try {
      await api.delete(`/employees/${deleteModal.id}`);
      setDeleteModal({ show: false, id: null, name: '' });
      fetchData();
      alert('Employee removed successfully');
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete employee: ' + (err.response?.data || err.message));
    }
  };

  const handleLeaveAction = async () => {
    if (!confirmModal.id) return;
    try {
      await api.put(`/leaves/${confirmModal.id}`, { status: confirmModal.status });
      setConfirmModal({ show: false, id: null, status: '' });
      fetchData();
    } catch (err) {
      console.error('Error updating leave status', err);
      alert('Failed to update leave status: ' + (err.response?.data || err.message));
    }
  };

  const downloadMonthlyPDF = () => {
    try {
      const filteredData = selectedEmployeeForReport === 'all' 
        ? monthlyReport 
        : monthlyReport.filter(r => r.employee_id === parseInt(selectedEmployeeForReport));

      if (!filteredData || filteredData.length === 0) {
        alert("No data available to generate report.");
        return;
      }

      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("EMS Monthly Performance Report", 14, 20);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);

      const tableColumn = ["Date", "Employee", "In / Out", "Work Time", "Idle Time", "Work Done"];
      const tableRows = filteredData.map(row => [
        row.date ? new Date(row.date).toLocaleDateString() : '-',
        row.employee_name || 'N/A',
        `${row.login_time ? new Date(row.login_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'} / ${row.logout_time ? new Date(row.logout_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}`,
        `${row.active_minutes || 0}m`,
        `${row.idle_minutes || 0}m`,
        row.report_text || '-'
      ]);

      const empName = selectedEmployeeForReport === 'all' ? 'All' : (filteredData[0]?.employee_name || 'Employee').replace(/[^a-z0-9]/gi, '_');

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 35,
        theme: 'grid',
        styles: { fontSize: 7, cellPadding: 2 },
        headStyles: { fillColor: [79, 70, 229] },
        columnStyles: {
          5: { cellWidth: 50 } // Limit Work Done column width
        }
      });

      doc.save(`EMS_Report_${empName}_${Date.now()}.pdf`);
    } catch (error) {
      console.error("PDF Export Error:", error);
      alert("Error generating PDF: " + error.message);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{ 
        width: '260px', 
        background: 'var(--bg-card)', 
        padding: '24px', 
        borderRight: '1px solid var(--border)',
        height: '100vh',
        position: 'sticky',
        top: 0,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <h2 style={{ marginBottom: '40px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Clock /> EMS Admin
        </h2>

        <nav style={{ flex: 1 }}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
            { id: 'employees', label: 'Employees', icon: <Users size={20} /> },
            { id: 'activity', label: 'Live Status', icon: <Clock size={20} /> },
            { id: 'reports', label: 'Work Reports', icon: <FileText size={20} /> },
            { id: 'monthly', label: 'Monthly Report', icon: <Calendar size={20} /> },
            { id: 'screenshots', label: 'Screenshots', icon: <Camera size={20} /> },
            { id: 'leaves', label: 'Leave Requests', icon: <CalendarDays size={20} /> },
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
          onClick={() => { logout('admin'); navigate('/admin'); }}
          style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)', background: 'transparent' }}
        >
          <LogOut size={20} /> Logout
        </button>
      </div>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto', background: '#f8fafc' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
          {activeTab === 'employees' && (
            <button className="btn-primary" onClick={() => setShowAddModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={20} /> Add Employee
            </button>
          )}
        </header>

        {activeTab === 'dashboard' && (
          <div className="animate-fade-in">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
              <div className="glass-card">
                <h3 style={{ marginBottom: '20px' }}>Attendance Overview</h3>
                <Bar
                  data={{
                    labels: [...new Set(attendance.map(a => new Date(a.date).toLocaleDateString()))].slice(-7),
                    datasets: [{
                      label: 'Total Employees Present',
                      data: [...new Set(attendance.map(a => new Date(a.date).toLocaleDateString()))].slice(-7).map(date =>
                        attendance.filter(a => new Date(a.date).toLocaleDateString() === date).length
                      ),
                      backgroundColor: 'rgba(79, 70, 229, 0.6)',
                      borderRadius: 6
                    }]
                  }}
                  options={{ responsive: true, plugins: { legend: { display: false } } }}
                />
              </div>
              <div className="glass-card">
                <h3 style={{ marginBottom: '20px' }}>Live Employee Status</h3>
                <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
                  <Pie
                    data={{
                      labels: ['Active', 'Idle', 'Offline'],
                      datasets: [{
                        data: [
                          activity.filter(a => a.status === 'active').length,
                          activity.filter(a => a.status === 'idle').length,
                          employees.length - activity.length
                        ],
                        backgroundColor: ['#10b981', '#f59e0b', '#64748b']
                      }]
                    }}
                    options={{ maintainAspectRatio: false }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
              <div className="glass-card" style={{ textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '5px' }}>Total Employees</p>
                <h2>{employees.length}</h2>
              </div>
              <div className="glass-card" style={{ textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '5px' }}>Currently Active</p>
                <h2 style={{ color: 'var(--accent)' }}>{activity.filter(a => a.status === 'active').length}</h2>
              </div>
              <div className="glass-card" style={{ textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '5px' }}>Pending Leaves</p>
                <h2 style={{ color: 'var(--warning)' }}>{leaves.filter(l => l.status === 'pending').length}</h2>
              </div>
              <div className="glass-card" style={{ textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '5px' }}>Daily Reports Today</p>
                <h2>{reports.filter(r => new Date(r.created_at).toDateString() === new Date().toDateString()).length}</h2>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'employees' && (
          <div className="glass-card animate-fade-in">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '16px' }}>Name</th>
                  <th>Email</th>
                  <th>Total Work Time</th>
                  <th>Total Idle Time</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => {
                  const empAttendance = attendance.filter(a => a.employee_id === emp.id);
                  const totalActiveMinutes = empAttendance.reduce((acc, curr) => acc + (curr.active_minutes || 0), 0);
                  const totalIdleMinutes = empAttendance.reduce((acc, curr) => acc + (curr.idle_minutes || 0), 0);

                  return (
                    <tr key={emp.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px' }}>{emp.name}</td>
                      <td>{emp.email}</td>
                      <td style={{ color: 'var(--accent)', fontWeight: 'bold' }}>
                        {(totalActiveMinutes / 60).toFixed(2)}h
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '5px', fontWeight: 'normal' }}>
                          ({totalActiveMinutes}m)
                        </span>
                      </td>
                      <td style={{ color: 'var(--warning)', fontWeight: 'bold' }}>
                        {(totalIdleMinutes / 60).toFixed(2)}h
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '5px', fontWeight: 'normal' }}>
                          ({totalIdleMinutes}m)
                        </span>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <button
                          onClick={() => setDeleteModal({ show: true, id: emp.id, name: emp.name })}
                          style={{ color: 'var(--danger)', background: 'transparent', cursor: 'pointer' }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'activity' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {activity.map(act => (
              <div key={act.id} className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '12px', height: '12px', borderRadius: '50%',
                  background: act.status === 'active' ? 'var(--accent)' : act.status === 'idle' ? 'var(--warning)' : '#64748b'
                }} />
                <div>
                  <h3 style={{ fontSize: '1.1rem' }}>{act.name}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {act.status ? act.status.charAt(0).toUpperCase() + act.status.slice(1) : 'Offline'}
                    {act.timestamp && ` • ${new Date(act.timestamp).toLocaleTimeString()}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="glass-card">
            {reports.map(report => (
              <div key={report.id} style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--primary)' }}>{report.employee_name}</strong>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{new Date(report.created_at).toLocaleString()}</span>
                </div>
                <p>{report.report_text}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'leaves' && (
          <div className="glass-card">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '16px' }}>Employee</th>
                  <th>Reason</th>
                  <th>Dates</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map(leave => (
                  <tr key={leave.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px' }}>{leave.employee_name}</td>
                    <td>{leave.reason}</td>
                    <td>{new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}</td>
                    <td>
                      <span style={{
                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                        background: leave.status === 'approved' ? 'rgba(16, 185, 129, 0.2)' : leave.status === 'rejected' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                        color: leave.status === 'approved' ? 'var(--accent)' : leave.status === 'rejected' ? 'var(--danger)' : 'var(--warning)'
                      }}>
                        {leave.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {leave.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button
                            onClick={() => setConfirmModal({ show: true, id: leave.id, status: 'approved' })}
                            style={{ background: 'var(--accent)', color: 'white', padding: '5px', cursor: 'pointer' }}
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => setConfirmModal({ show: true, id: leave.id, status: 'rejected' })}
                            style={{ background: 'var(--danger)', color: 'white', padding: '5px', cursor: 'pointer' }}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {activeTab === 'monthly' && (
          <div className="glass-card" style={{ overflowX: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '0 16px', gap: '15px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ margin: 0 }}>Monthly Performance</h3>
                <select 
                  className="input-field" 
                  style={{ width: '200px', marginBottom: 0, padding: '5px 10px' }}
                  value={selectedEmployeeForReport}
                  onChange={(e) => setSelectedEmployeeForReport(e.target.value)}
                >
                  <option value="all">All Employees</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>
              <button 
                onClick={downloadMonthlyPDF}
                className="btn-primary" 
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}
              >
                <Download size={18} /> Download PDF
              </button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '16px' }}>Date</th>
                  <th>Employee</th>
                  <th>In / Out</th>
                  <th>Work Time</th>
                  <th>Idle Time</th>
                  <th>Extra</th>
                  <th>Work Done</th>
                </tr>
              </thead>
              <tbody>
                {monthlyReport
                  .filter(row => selectedEmployeeForReport === 'all' || row.employee_id === parseInt(selectedEmployeeForReport))
                  .map((row, idx) => {
                    const extra = row.total_hours ? Math.max(0, row.total_hours - 8).toFixed(2) : '0.00';
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border)', fontSize: '0.9rem' }}>
                        <td style={{ padding: '16px' }}>{row.date ? new Date(row.date).toLocaleDateString() : '-'}</td>
                        <td style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{row.employee_name}</td>
                      <td>
                        {row.login_time ? new Date(row.login_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                        {' / '}
                        {row.logout_time ? new Date(row.logout_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      <td style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{row.active_minutes || 0}m</td>
                      <td style={{ color: 'var(--warning)' }}>{row.idle_minutes || 0}m</td>
                      <td style={{ color: extra > 0 ? 'var(--accent)' : 'var(--text-muted)' }}>{extra}h</td>
                      <td style={{ maxWidth: '300px', padding: '10px 0' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '4px' }}>
                          {row.report_text || <span style={{ color: 'var(--text-muted)' }}>No report submitted</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {activeTab === 'screenshots' && (
          <div className="animate-fade-in">
            {!viewingFolder ? (
              <>
                <h3 style={{ marginBottom: '20px' }}>Employee Folders</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '20px' }}>
                  {employees.map(emp => {
                    const empScreenshots = screenshots.filter(ss => ss.employee_id === emp.id);
                    return (
                      <div 
                        key={emp.id} 
                        className="glass-card" 
                        onClick={() => setViewingFolder(emp)}
                        style={{ 
                          textAlign: 'center', 
                          padding: '20px', 
                          cursor: 'pointer',
                          border: '2px solid transparent',
                          transition: '0.3s',
                          position: 'relative'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                        onMouseOut={(e) => e.currentTarget.style.borderColor = 'transparent'}
                      >
                        <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📁</div>
                        <strong style={{ display: 'block', marginBottom: '5px' }}>{emp.name}</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{empScreenshots.length} Screenshots</span>
                      </div>
                    );
                  })}
                  {employees.length === 0 && <p>No employees found.</p>}
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                  <button 
                    onClick={() => setViewingFolder(null)}
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '5px 15px', borderRadius: '5px', cursor: 'pointer' }}
                  >
                    ← Back to Folders
                  </button>
                  <h3 style={{ margin: 0 }}>Screenshots: {viewingFolder.name}</h3>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                  {screenshots
                    .filter(ss => ss.employee_id === viewingFolder.id)
                    .map((ss, idx) => (
                      <div key={idx} className="glass-card" style={{ padding: '10px' }}>
                        <img
                          src={`${API_BASE_URL}/uploads/screenshots/${ss.file_path}`}
                          alt="screenshot"
                          style={{ width: '100%', borderRadius: '8px', cursor: 'pointer' }}
                          onClick={() => window.open(`${API_BASE_URL}/uploads/screenshots/${ss.file_path}`, '_blank')}
                        />
                        <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {new Date(ss.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  {screenshots.filter(ss => ss.employee_id === viewingFolder.id).length === 0 && (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      No screenshots found in this folder.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ width: '400px' }}>
            <h2 style={{ marginBottom: '20px' }}>Add New Employee</h2>
            <form onSubmit={handleAddEmployee}>
              <input
                className="input-field" placeholder="Full Name" required
                value={newEmployee.name} onChange={e => setNewEmployee({ ...newEmployee, name: e.target.value })}
              />
              <input
                className="input-field" type="email" placeholder="Email" required
                value={newEmployee.email} onChange={e => setNewEmployee({ ...newEmployee, email: e.target.value })}
              />
              <input
                className="input-field" type="password" placeholder="Password" required
                value={newEmployee.password} onChange={e => setNewEmployee({ ...newEmployee, password: e.target.value })}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Add</button>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ flex: 1, background: 'transparent', border: '1px solid var(--border)', color: '#64748b' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Leave Action Confirmation Modal */}
      {confirmModal.show && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
          <div className="glass-card" style={{ width: '400px', textAlign: 'center', padding: '40px' }}>
            <Calendar size={48} style={{ color: 'var(--primary)', marginBottom: '20px' }} />
            <h2 style={{ marginBottom: '10px' }}>Confirm Action</h2>
            <p style={{ marginBottom: '30px', color: 'var(--text-muted)' }}>
              Are you sure you want to <strong>{confirmModal.status}</strong> this leave request?
            </p>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button
                onClick={handleLeaveAction}
                className="btn-primary"
                style={{ flex: 1, background: confirmModal.status === 'approved' ? 'var(--accent)' : 'var(--danger)' }}
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirmModal({ show: false, id: null, status: '' })}
                style={{ flex: 1, background: 'transparent', border: '1px solid var(--border)', color: '#64748b', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
          <div className="glass-card" style={{ width: '400px', textAlign: 'center', padding: '40px' }}>
            <Trash2 size={48} style={{ color: 'var(--danger)', marginBottom: '20px' }} />
            <h2 style={{ marginBottom: '10px' }}>Remove Employee</h2>
            <p style={{ marginBottom: '30px', color: 'var(--text-muted)' }}>
              Are you sure you want to remove <strong>{deleteModal.name}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button
                onClick={handleDeleteEmployee}
                className="btn-primary"
                style={{ flex: 1, background: 'var(--danger)' }}
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteModal({ show: false, id: null, name: '' })}
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

export default AdminDashboard;
