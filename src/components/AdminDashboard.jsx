import React, { useState } from 'react';

const getTabIcon = (tabId) => {
  switch (tabId) {
    case 'overview':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}>
          <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
      );
    case 'employees':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      );
    case 'requests':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}>
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
        </svg>
      );
    case 'database':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}>
          <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/>
        </svg>
      );
    default:
      return null;
  }
};

const formatFieldLabel = (key) => {
  const labels = {
    oldName: 'Current Registered Name',
    newName: 'Proposed New Name',
    govtId: 'Aadhar Card Number',
    reason: 'Reason for Change',
    oldDesignation: 'Current Designation',
    newDesignation: 'Proposed New Designation',
    orderRef: 'Promotion/Transfer Order Reference',
    date: 'Effective Date',
    mobile: 'Contact Mobile Number',
    emergencyContact: 'Emergency Contact Person',
    emergencyMobile: 'Emergency Contact Mobile',
    address: 'Residential Address',
    oldAadhaar: 'Current Aadhaar Number',
    newAadhaar: 'Proposed New Aadhaar Number',
    email: 'Current VPA Email ID',
    newEmail: 'Proposed New Email ID',
    details: 'Update Details / Description',
    fileName: 'File Subject / Title',
    fileType: 'Department Module',
    permission: 'Required Permission Access',
    purpose: 'Purpose of Access',
    subject: 'Subject Line',
    recipient: 'Recipient Authority',
    body: 'Draft Content',
    description: 'Detailed Description',
    section: 'Portal Section / URL'
  };
  return labels[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
};

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'employees', label: 'Employee Directory' },
  { id: 'requests', label: 'Request Management' },
  { id: 'database', label: 'Database Explorer' },
];

const AdminDashboard = ({ users, requests, emailLogs = [], loginLogs = [], onUpdateRequestStatus, onDeleteRequest, onDeleteEmployee, onClearRequests, onNavigateHome, currentUser }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isResolving, setIsResolving] = useState(false);
  const [resolutionRemarks, setResolutionRemarks] = useState('');
  const [resolutionData, setResolutionData] = useState({});

  const handleSelectRequest = (req) => {
    setSelectedRequest(req);
    setIsResolving(false);
    setResolutionRemarks('');
    setResolutionData(req && req.formData ? { ...req.formData } : {});
  };

  const renderResolutionForm = () => {
    if (!selectedRequest) return null;
    const { subRequest } = selectedRequest;

    const handleDataChange = (key, val) => {
      setResolutionData(prev => ({ ...prev, [key]: val }));
    };

    switch (subRequest) {
      case 'Name Change':
        return (
          <>
            <div className="admin-form-group" style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', marginBottom: '6px', color: 'var(--navy)' }}>Name to Apply</label>
              <input 
                type="text" 
                value={resolutionData.newName || ''} 
                onChange={(e) => handleDataChange('newName', e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1.5px solid var(--grey-300)', borderRadius: '8px', fontSize: '13px' }}
                required
              />
            </div>
            <div className="admin-form-group" style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', marginBottom: '6px', color: 'var(--navy)' }}>Aadhaar Number to Apply</label>
              <input 
                type="text" 
                value={resolutionData.govtId || ''} 
                onChange={(e) => handleDataChange('govtId', e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1.5px solid var(--grey-300)', borderRadius: '8px', fontSize: '13px' }}
                required
              />
            </div>
          </>
        );
      case 'Aadhaar Change':
        return (
          <div className="admin-form-group" style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', marginBottom: '6px', color: 'var(--navy)' }}>Aadhaar Number to Apply</label>
            <input 
              type="text" 
              value={resolutionData.newAadhaar || ''} 
              onChange={(e) => handleDataChange('newAadhaar', e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1.5px solid var(--grey-300)', borderRadius: '8px', fontSize: '13px' }}
              required
            />
          </div>
        );
      case 'Designation Update':
        return (
          <div className="admin-form-group" style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', marginBottom: '6px', color: 'var(--navy)' }}>Designation to Apply</label>
            <input 
              type="text" 
              value={resolutionData.newDesignation || ''} 
              onChange={(e) => handleDataChange('newDesignation', e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1.5px solid var(--grey-300)', borderRadius: '8px', fontSize: '13px' }}
              required
            />
          </div>
        );
      case 'Contact Details':
        return (
          <>
            <div className="admin-form-group" style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', marginBottom: '6px', color: 'var(--navy)' }}>Mobile Number to Apply</label>
              <input 
                type="text" 
                value={resolutionData.mobile || ''} 
                onChange={(e) => handleDataChange('mobile', e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1.5px solid var(--grey-300)', borderRadius: '8px', fontSize: '13px' }}
                required
              />
            </div>
            <div className="admin-form-group" style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', marginBottom: '6px', color: 'var(--navy)' }}>Residential Address to Apply</label>
              <textarea 
                value={resolutionData.address || ''} 
                onChange={(e) => handleDataChange('address', e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1.5px solid var(--grey-300)', borderRadius: '8px', fontSize: '13px', minHeight: '60px', resize: 'vertical' }}
                required
              />
            </div>
            <div className="admin-form-group" style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', marginBottom: '6px', color: 'var(--navy)' }}>Emergency Contact Name to Apply</label>
              <input 
                type="text" 
                value={resolutionData.emergencyContact || ''} 
                onChange={(e) => handleDataChange('emergencyContact', e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1.5px solid var(--grey-300)', borderRadius: '8px', fontSize: '13px' }}
              />
            </div>
            <div className="admin-form-group" style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', marginBottom: '6px', color: 'var(--navy)' }}>Emergency Contact Mobile to Apply</label>
              <input 
                type="text" 
                value={resolutionData.emergencyMobile || ''} 
                onChange={(e) => handleDataChange('emergencyMobile', e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1.5px solid var(--grey-300)', borderRadius: '8px', fontSize: '13px' }}
              />
            </div>
          </>
        );
      case 'Email Updation':
        return (
          <div className="admin-form-group" style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', marginBottom: '6px', color: 'var(--navy)' }}>New VPA Email ID to Apply</label>
            <input 
              type="email" 
              value={resolutionData.newEmail || ''} 
              onChange={(e) => handleDataChange('newEmail', e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1.5px solid var(--grey-300)', borderRadius: '8px', fontSize: '13px' }}
              required
            />
          </div>
        );
      default:
        return null;
    }
  };

  // Stats
  const totalEmployees = users.length;
  const totalRequests = requests.length;
  const pendingRequests = requests.filter(r => r.status === 'Pending').length;
  const resolvedRequests = requests.filter(r => r.status === 'Resolved').length;
  const rejectedRequests = requests.filter(r => r.status === 'Rejected').length;
  const inProgressRequests = requests.filter(r => r.status === 'In Progress').length;

  // Filtered data
  const filteredEmployees = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.gmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRequests = requests.filter(r => {
    const matchesSearch = r.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.subRequest?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.ticketId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Request actions
  const updateRequestStatus = (ticketId, newStatus, remarks = '', data = null) => {
    onUpdateRequestStatus(ticketId, newStatus, remarks, data);
  };

  const deleteRequest = (ticketId) => {
    onDeleteRequest(ticketId);
  };

  const deleteEmployee = (employeeId) => {
    onDeleteEmployee(employeeId);
    setSelectedEmployee(null);
  };

  return (
    <div className="admin-dashboard">
      {/* ADMIN HEADER */}
      <div className="admin-header">
        <div className="admin-header-left">
          <h1>Admin Control Panel</h1>
          <p>Visakhapatnam Port Authority — System Administration</p>
        </div>
        <button className="admin-home-btn" onClick={onNavigateHome}>
          ← Back to Portal
        </button>
      </div>

      {/* TAB NAVIGATION */}
      <div className="admin-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => { setActiveTab(tab.id); setSearchTerm(''); setSelectedEmployee(null); setSelectedRequest(null); }}
          >
            <span className="admin-tab-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>{getTabIcon(tab.id)}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="admin-body">

        {/* ═══════════ OVERVIEW TAB ═══════════ */}
        {activeTab === 'overview' && (
          <div className="admin-overview">
            <div className="admin-stats-grid">
              <div className="admin-stat-card stat-blue">
                <div className="admin-stat-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--blue-800)' }}>
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <div className="admin-stat-num">{totalEmployees}</div>
                <div className="admin-stat-label">Registered Employees</div>
              </div>
              <div className="admin-stat-card stat-teal">
                <div className="admin-stat-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--blue-900)' }}>
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                  </svg>
                </div>
                <div className="admin-stat-num">{totalRequests}</div>
                <div className="admin-stat-label">Total Requests</div>
              </div>
              <div className="admin-stat-card stat-amber">
                <div className="admin-stat-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#a16207' }}>
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <div className="admin-stat-num">{pendingRequests}</div>
                <div className="admin-stat-label">Pending</div>
              </div>
              <div className="admin-stat-card stat-indigo">
                <div className="admin-stat-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#4f46e5' }}>
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
                  </svg>
                </div>
                <div className="admin-stat-num">{inProgressRequests}</div>
                <div className="admin-stat-label">In Progress</div>
              </div>
              <div className="admin-stat-card stat-green">
                <div className="admin-stat-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#15803d' }}>
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                </div>
                <div className="admin-stat-num">{resolvedRequests}</div>
                <div className="admin-stat-label">Resolved</div>
              </div>
              <div className="admin-stat-card stat-red">
                <div className="admin-stat-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#b91c1c' }}>
                    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                </div>
                <div className="admin-stat-num">{rejectedRequests}</div>
                <div className="admin-stat-label">Rejected</div>
              </div>
            </div>

            {/* RECENT ACTIVITY */}
            <div className="admin-section-card">
              <h3>Recent Requests</h3>
              {requests.length === 0 ? (
                <p className="admin-empty">No requests in the system yet.</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Ticket ID</th>
                      <th>Employee</th>
                      <th>Category</th>
                      <th>Sub-Request</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.slice(-5).reverse().map((r, i) => (
                      <tr key={i}>
                        <td><code>{r.ticketId}</code></td>
                        <td>{r.employeeId}</td>
                        <td>{r.category}</td>
                        <td>{r.subRequest}</td>
                        <td><span className={`status-badge status-${r.status?.toLowerCase().replace(' ', '-')}`}>{r.status}</span></td>
                        <td>{r.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ═══════════ EMPLOYEES TAB ═══════════ */}
        {activeTab === 'employees' && (
          <div className="admin-employees">
            <div className="admin-toolbar">
              <input
                type="text"
                placeholder="Search by name, ID, or email..."
                className="admin-search"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <div className="admin-toolbar-info">
                {filteredEmployees.length} employee{filteredEmployees.length !== 1 ? 's' : ''} found
              </div>
            </div>

            {filteredEmployees.length === 0 ? (
              <div className="admin-empty-state">
                <p>No employees registered yet.</p>
              </div>
            ) : (
              <div className="admin-cards-grid">
                {filteredEmployees.map((emp, i) => (
                  <div key={i} className="admin-emp-card" onClick={() => setSelectedEmployee(emp)}>
                    <div className="admin-emp-avatar">{emp.name.charAt(0).toUpperCase()}</div>
                    <div className="admin-emp-info">
                      <div className="admin-emp-name">{emp.name}</div>
                      <div className="admin-emp-id">{emp.employeeId}</div>
                      <div className="admin-emp-email">{emp.gmail}</div>
                    </div>
                    <div className="admin-emp-requests">
                      {requests.filter(r => r.employeeId === emp.employeeId).length} requests
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Employee detail modal */}
            {selectedEmployee && (
              <div className="admin-modal-overlay" onClick={() => setSelectedEmployee(null)}>
                <div className="admin-modal" onClick={e => e.stopPropagation()}>
                  <button className="admin-modal-close" onClick={() => setSelectedEmployee(null)}>×</button>
                  <div className="admin-modal-header">
                    <div className="admin-emp-avatar-lg">{selectedEmployee.name.charAt(0).toUpperCase()}</div>
                    <h3>{selectedEmployee.name}</h3>
                    <p className="admin-emp-id-lg">{selectedEmployee.employeeId}</p>
                  </div>
                  <div className="admin-modal-details">
                    <div className="admin-detail-row">
                      <span className="admin-detail-label">Employee ID</span>
                      <span className="admin-detail-value"><code>{selectedEmployee.employeeId}</code></span>
                    </div>
                    <div className="admin-detail-row">
                      <span className="admin-detail-label">Full Name</span>
                      <span className="admin-detail-value">{selectedEmployee.name}</span>
                    </div>
                    <div className="admin-detail-row">
                      <span className="admin-detail-label">Email</span>
                      <span className="admin-detail-value">{selectedEmployee.gmail}</span>
                    </div>
                    <div className="admin-detail-row">
                      <span className="admin-detail-label">Designation</span>
                      <span className="admin-detail-value">{selectedEmployee.designation || <em style={{color: '#9ca3af'}}>Not Set</em>}</span>
                    </div>
                    <div className="admin-detail-row">
                      <span className="admin-detail-label">Aadhaar Number</span>
                      <span className="admin-detail-value">
                        {selectedEmployee.aadhaarNumber ? `XXXX-XXXX-${selectedEmployee.aadhaarNumber.slice(-4)}` : <em style={{color: '#9ca3af'}}>Not Set</em>}
                      </span>
                    </div>
                    <div className="admin-detail-row">
                      <span className="admin-detail-label">Mobile Number</span>
                      <span className="admin-detail-value">{selectedEmployee.mobile || <em style={{color: '#9ca3af'}}>Not Set</em>}</span>
                    </div>
                    <div className="admin-detail-row">
                      <span className="admin-detail-label">Residential Address</span>
                      <span className="admin-detail-value">{selectedEmployee.address || <em style={{color: '#9ca3af'}}>Not Set</em>}</span>
                    </div>
                    {(selectedEmployee.emergencyContact || selectedEmployee.emergencyMobile) && (
                      <div className="admin-detail-row">
                        <span className="admin-detail-label">Emergency Contact</span>
                        <span className="admin-detail-value">
                          {selectedEmployee.emergencyContact || 'N/A'} ({selectedEmployee.emergencyMobile || 'N/A'})
                        </span>
                      </div>
                    )}
                    <div className="admin-detail-row">
                      <span className="admin-detail-label">Total Requests</span>
                      <span className="admin-detail-value">
                        {requests.filter(r => r.employeeId === selectedEmployee.employeeId).length}
                      </span>
                    </div>
                  </div>
                  {/* Employee's requests */}
                  <div className="admin-modal-section">
                    <h4>Request History</h4>
                    {requests.filter(r => r.employeeId === selectedEmployee.employeeId).length === 0 ? (
                      <p className="admin-empty" style={{ fontSize: '12px' }}>No requests from this employee.</p>
                    ) : (
                      <table className="admin-table admin-table-sm">
                        <thead>
                          <tr><th>Ticket</th><th>Type</th><th>Status</th><th>Date</th></tr>
                        </thead>
                        <tbody>
                          {requests.filter(r => r.employeeId === selectedEmployee.employeeId).map((r, i) => (
                            <tr key={i}>
                              <td><code>{r.ticketId}</code></td>
                              <td>{r.subRequest}</td>
                              <td><span className={`status-badge status-${r.status?.toLowerCase().replace(' ', '-')}`}>{r.status}</span></td>
                              <td>{r.date}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                  <div className="admin-modal-actions">
                    <button className="admin-btn-danger" onClick={() => {
                      if (window.confirm(`Delete employee ${selectedEmployee.name}? This cannot be undone.`)) {
                        deleteEmployee(selectedEmployee.employeeId);
                      }
                    }}>
                      Delete Employee
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════ REQUESTS TAB ═══════════ */}
        {activeTab === 'requests' && (
          <div className="admin-requests">
            <div className="admin-toolbar">
              <input
                type="text"
                placeholder="Search by ticket, employee, or category..."
                className="admin-search"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <div className="admin-status-filters">
                {['all', 'Pending', 'In Progress', 'Escalated', 'Resolved', 'Rejected'].map(s => (
                  <button
                    key={s}
                    className={`admin-filter-btn ${statusFilter === s ? 'active' : ''}`}
                    onClick={() => setStatusFilter(s)}
                  >
                    {s === 'all' ? 'All' : s}
                  </button>
                ))}
              </div>
            </div>

            {filteredRequests.length === 0 ? (
              <div className="admin-empty-state">
                <p>No requests match your criteria.</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Employee</th>
                    <th>Category</th>
                    <th>Sub-Request</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((r, i) => (
                    <tr key={i}>
                      <td><code>{r.ticketId}</code></td>
                      <td>{r.employeeId}</td>
                      <td>{r.category}</td>
                      <td>{r.subRequest}</td>
                      <td>
                        <span className={`status-badge status-${r.status?.toLowerCase().replace(' ', '-')}`}>
                          {r.status}
                        </span>
                      </td>
                      <td>{r.date}</td>
                      <td>
                        <div className="admin-action-btns" style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            className="btn-solid" 
                            style={{ padding: '6px 12px', fontSize: '11px', background: 'var(--blue-800)', color: 'white', minWidth: '95px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '500' }}
                            onClick={() => handleSelectRequest(r)}
                          >
                            View Details
                          </button>
                          <button 
                            className="btn-outline" 
                            style={{ padding: '6px 12px', fontSize: '11px', borderColor: '#dc2626', color: '#dc2626', background: 'transparent', minWidth: '65px', borderRadius: '6px', border: '1px solid #dc2626', cursor: 'pointer', fontWeight: '500' }}
                            onClick={() => {
                              if (window.confirm(`Delete ticket ${r.ticketId}?`)) deleteRequest(r.ticketId);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Request detail modal */}
            {selectedRequest && (
              <div className="admin-modal-overlay" onClick={() => handleSelectRequest(null)}>
                <div className="admin-modal" onClick={e => e.stopPropagation()}>
                  <button className="admin-modal-close" onClick={() => handleSelectRequest(null)}>×</button>
                  <div className="admin-modal-header">
                    <h3>Request Details</h3>
                    <p className="admin-emp-id-lg">{selectedRequest.ticketId}</p>
                  </div>

                  {!isResolving ? (
                    <>
                      <div className="admin-modal-details">
                        <div className="admin-detail-row">
                          <span className="admin-detail-label">Ticket ID</span>
                          <span className="admin-detail-value"><code>{selectedRequest.ticketId}</code></span>
                        </div>
                        <div className="admin-detail-row">
                          <span className="admin-detail-label">Employee ID</span>
                          <span className="admin-detail-value">{selectedRequest.employeeId}</span>
                        </div>
                        <div className="admin-detail-row">
                          <span className="admin-detail-label">Category</span>
                          <span className="admin-detail-value">{selectedRequest.category}</span>
                        </div>
                        <div className="admin-detail-row">
                          <span className="admin-detail-label">Sub-Request</span>
                          <span className="admin-detail-value">{selectedRequest.subRequest}</span>
                        </div>
                        <div className="admin-detail-row">
                          <span className="admin-detail-label">Status</span>
                          <span className="admin-detail-value">
                            <span className={`status-badge status-${selectedRequest.status?.toLowerCase().replace(' ', '-')}`}>
                              {selectedRequest.status}
                            </span>
                          </span>
                        </div>
                        <div className="admin-detail-row">
                          <span className="admin-detail-label">Date</span>
                          <span className="admin-detail-value">{selectedRequest.date}</span>
                        </div>
                        {/* Show form data */}
                        {selectedRequest.formData && Object.keys(selectedRequest.formData).length > 0 && (
                          <div style={{
                            marginTop: '1.5rem',
                            background: 'var(--grey-50)',
                            border: '1.5px solid var(--grey-200)',
                            borderRadius: '10px',
                            padding: '16px'
                          }}>
                            <h4 style={{ margin: '0 0 1rem', fontSize: '13px', color: 'var(--navy)', fontWeight: 600, borderBottom: '1px solid var(--grey-200)', paddingBottom: '6px' }}>Submitted Information</h4>
                            {Object.entries(selectedRequest.formData).map(([key, val]) => (
                              <div className="admin-detail-row" key={key} style={{ borderBottom: 'none', padding: '6px 0' }}>
                                <span className="admin-detail-label" style={{ fontWeight: 500, color: '#4b5563' }}>{formatFieldLabel(key)}</span>
                                <span className="admin-detail-value" style={{ fontWeight: 600, color: 'var(--navy)' }}>{val}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {/* Auto-apply DB update notification banner */}
                        {['Name Change', 'Aadhaar Change', 'Designation Update', 'Contact Details', 'Email Updation'].includes(selectedRequest.subRequest) && (
                          <div style={{
                            background: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            borderRadius: '8px',
                            padding: '12px',
                            marginTop: '1.5rem',
                            fontSize: '12px',
                            color: '#1e3a8a',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            lineHeight: '1.4'
                          }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                              <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                            </svg>
                            <span>
                              <strong>Database Auto-Resolution Active:</strong> Approving / Resolving this ticket will automatically update the employee's profile details in MongoDB.
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="admin-modal-actions">
                        {(!selectedRequest.status || !['Resolved', 'Rejected'].includes(selectedRequest.status)) && 
                         !(currentUser?.adminLevel === 'assistant' && selectedRequest.status === 'Escalated') && (
                          <>
                            <button className="admin-btn-success" onClick={() => setIsResolving(true)}>
                              Resolve
                            </button>
                            <button className="admin-btn-warning" onClick={() => { updateRequestStatus(selectedRequest.ticketId, 'In Progress'); handleSelectRequest(null); }}>
                              In Progress
                            </button>
                            {currentUser?.adminLevel === 'assistant' && (
                              <button className="btn-outline" style={{ borderColor: '#7e22ce', color: '#7e22ce', background: '#f3e8ff' }} onClick={() => { updateRequestStatus(selectedRequest.ticketId, 'Escalated'); handleSelectRequest(null); }}>
                                Transfer to Superior
                              </button>
                            )}
                            <button className="admin-btn-danger" onClick={() => { updateRequestStatus(selectedRequest.ticketId, 'Rejected'); handleSelectRequest(null); }}>
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="admin-modal-details">
                        <h4 style={{ margin: '0 0 1rem', fontSize: '14px', color: 'var(--navy)', fontWeight: '700', borderBottom: '2px solid var(--blue-800)', paddingBottom: '6px' }}>
                          Resolve Ticket - Verify & Confirm Update
                        </h4>

                        {renderResolutionForm()}

                        <div className="admin-form-group" style={{ marginBottom: '16px', marginTop: '16px' }}>
                          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '6px', color: 'var(--navy)' }}>
                            Resolution Remarks / Action Taken {['Name Change', 'Aadhaar Change', 'Designation Update', 'Contact Details', 'Email Updation'].includes(selectedRequest.subRequest) ? '(Optional)' : '(Required)'}
                          </label>
                          <textarea 
                            placeholder="Describe action taken to resolve this ticket..."
                            value={resolutionRemarks}
                            onChange={(e) => setResolutionRemarks(e.target.value)}
                            style={{ width: '100%', padding: '10px', border: '1.5px solid var(--grey-300)', borderRadius: '8px', fontSize: '13px', minHeight: '80px', resize: 'vertical' }}
                            required={!['Name Change', 'Aadhaar Change', 'Designation Update', 'Contact Details', 'Email Updation'].includes(selectedRequest.subRequest)}
                          />
                        </div>
                      </div>

                      <div className="admin-modal-actions">
                        <button 
                          className="admin-btn-success"
                          style={{ flex: 1, padding: '10px', fontSize: '13px' }}
                          onClick={() => {
                            const isRemarksRequired = !['Name Change', 'Aadhaar Change', 'Designation Update', 'Contact Details', 'Email Updation'].includes(selectedRequest.subRequest);
                            if (isRemarksRequired && !resolutionRemarks.trim()) {
                              alert('Resolution Remarks are required to resolve this ticket.');
                              return;
                            }
                            updateRequestStatus(selectedRequest.ticketId, 'Resolved', resolutionRemarks, resolutionData);
                            handleSelectRequest(null);
                          }}
                        >
                          Confirm & Complete Resolution
                        </button>
                        <button 
                          className="admin-btn-warning"
                          style={{ padding: '10px 16px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                          onClick={() => setIsResolving(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════ DATABASE TAB ═══════════ */}
        {activeTab === 'database' && (
          <div className="admin-database">
            <div className="admin-db-section">
              <h3>Users Table <span className="admin-db-count">({users.length} records)</span></h3>
              <div className="admin-db-table-wrap">
                <table className="admin-table admin-table-db">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Employee ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Designation</th>
                      <th>Aadhaar Number</th>
                      <th>Mobile</th>
                      <th>Role</th>
                      <th>Account Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td><code>{u.employeeId}</code></td>
                        <td>{u.name}</td>
                        <td>{u.gmail}</td>
                        <td>{u.designation || <em style={{color: '#9ca3af'}}>Not Set</em>}</td>
                        <td>{u.aadhaarNumber ? `XXXX-XXXX-${u.aadhaarNumber.slice(-4)}` : <em style={{color: '#9ca3af'}}>Not Set</em>}</td>
                        <td>{u.mobile || <em style={{color: '#9ca3af'}}>Not Set</em>}</td>
                        <td>{u.isAdmin ? <span className="status-badge status-admin">Admin</span> : 'Employee'}</td>
                        <td style={{ fontSize: '11.5px', color: '#6b7280' }}>
                          {u.createdAt ? new Date(u.createdAt).toLocaleString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="admin-db-section">
              <h3>Requests Table <span className="admin-db-count">({requests.length} records)</span></h3>
              <div className="admin-db-table-wrap">
                <table className="admin-table admin-table-db">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Ticket ID</th>
                      <th>Employee ID</th>
                      <th>Category</th>
                      <th>Sub-Request</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Form Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((r, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td><code>{r.ticketId}</code></td>
                        <td>{r.employeeId}</td>
                        <td>{r.category}</td>
                        <td>{r.subRequest}</td>
                        <td><span className={`status-badge status-${r.status?.toLowerCase().replace(' ', '-')}`}>{r.status}</span></td>
                        <td>{r.date}</td>
                        <td className="admin-db-json">{JSON.stringify(r.formData || {})}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="admin-db-section" style={{ marginTop: '2.5rem' }}>
              <h3>System Email Logs <span className="admin-db-count">({emailLogs.length} records)</span></h3>
              <div className="admin-db-table-wrap">
                {emailLogs.length === 0 ? (
                  <p className="admin-empty" style={{ padding: '1.5rem', color: '#6b7280', textAlign: 'center', fontSize: '13px' }}>No email logs recorded yet.</p>
                ) : (
                  <table className="admin-table admin-table-db">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Recipient (To)</th>
                        <th>Subject</th>
                        <th>Status</th>
                        <th>Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {emailLogs.map((log, i) => (
                        <tr key={i}>
                          <td>{i + 1}</td>
                          <td><code>{log.to}</code></td>
                          <td>{log.subject}</td>
                          <td>
                            <span className={`status-badge status-${log.status?.toLowerCase().replace(' ', '-')}`}>
                              {log.status}
                            </span>
                            {log.error && <div style={{ fontSize: '11px', color: '#dc2626', marginTop: '2px' }}>{log.error}</div>}
                          </td>
                          <td>{new Date(log.createdAt || log.timestamp).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>



            <div className="admin-db-actions">
              <button className="admin-btn-export" onClick={() => {
                const data = { users, requests, exportedAt: new Date().toISOString() };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'vpa_database_export.json';
                a.click();
                URL.revokeObjectURL(url);
              }}>
                Export Full Database (JSON)
              </button>
              <button className="admin-btn-danger" onClick={() => {
                if (window.confirm('Clear ALL requests? This cannot be undone.')) {
                  onClearRequests();
                }
              }}>
                Clear All Requests
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
