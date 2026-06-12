import React, { useState } from 'react';

const TABS = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'employees', label: 'Employee Directory', icon: '👥' },
  { id: 'requests', label: 'Request Management', icon: '📋' },
  { id: 'database', label: 'Database Explorer', icon: '🗄️' },
];

const AdminDashboard = ({ users, requests, onUpdateRequests, onUpdateUsers, onNavigateHome }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);

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
  const updateRequestStatus = (ticketId, newStatus) => {
    const updated = requests.map(r =>
      r.ticketId === ticketId ? { ...r, status: newStatus } : r
    );
    onUpdateRequests(updated);
  };

  const deleteRequest = (ticketId) => {
    const updated = requests.filter(r => r.ticketId !== ticketId);
    onUpdateRequests(updated);
  };

  const deleteEmployee = (employeeId) => {
    const updated = users.filter(u => u.employeeId !== employeeId);
    onUpdateUsers(updated);
    setSelectedEmployee(null);
  };

  return (
    <div className="admin-dashboard">
      {/* ADMIN HEADER */}
      <div className="admin-header">
        <div className="admin-header-left">
          <h1>🛡️ Admin Control Panel</h1>
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
            <span className="admin-tab-icon">{tab.icon}</span>
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
                <div className="admin-stat-icon">👥</div>
                <div className="admin-stat-num">{totalEmployees}</div>
                <div className="admin-stat-label">Registered Employees</div>
              </div>
              <div className="admin-stat-card stat-teal">
                <div className="admin-stat-icon">📋</div>
                <div className="admin-stat-num">{totalRequests}</div>
                <div className="admin-stat-label">Total Requests</div>
              </div>
              <div className="admin-stat-card stat-amber">
                <div className="admin-stat-icon">⏳</div>
                <div className="admin-stat-num">{pendingRequests}</div>
                <div className="admin-stat-label">Pending</div>
              </div>
              <div className="admin-stat-card stat-indigo">
                <div className="admin-stat-icon">🔄</div>
                <div className="admin-stat-num">{inProgressRequests}</div>
                <div className="admin-stat-label">In Progress</div>
              </div>
              <div className="admin-stat-card stat-green">
                <div className="admin-stat-icon">✅</div>
                <div className="admin-stat-num">{resolvedRequests}</div>
                <div className="admin-stat-label">Resolved</div>
              </div>
              <div className="admin-stat-card stat-red">
                <div className="admin-stat-icon">❌</div>
                <div className="admin-stat-num">{rejectedRequests}</div>
                <div className="admin-stat-label">Rejected</div>
              </div>
            </div>

            {/* RECENT ACTIVITY */}
            <div className="admin-section-card">
              <h3>📌 Recent Requests</h3>
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
                placeholder="🔍 Search by name, ID, or email..."
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
                <div className="admin-empty-icon">👤</div>
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
                      <span className="admin-detail-value">{selectedEmployee.employeeId}</span>
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
                      🗑️ Delete Employee
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
                placeholder="🔍 Search by ticket, employee, or category..."
                className="admin-search"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <div className="admin-status-filters">
                {['all', 'Pending', 'In Progress', 'Resolved', 'Rejected'].map(s => (
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
                <div className="admin-empty-icon">📭</div>
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
                        <select
                          className={`status-select status-${r.status?.toLowerCase().replace(' ', '-')}`}
                          value={r.status}
                          onChange={e => updateRequestStatus(r.ticketId, e.target.value)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>
                      <td>{r.date}</td>
                      <td>
                        <div className="admin-action-btns">
                          <button className="admin-btn-sm admin-btn-view" onClick={() => setSelectedRequest(r)} title="View Details">👁️</button>
                          <button className="admin-btn-sm admin-btn-delete" onClick={() => {
                            if (window.confirm(`Delete ticket ${r.ticketId}?`)) deleteRequest(r.ticketId);
                          }} title="Delete">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Request detail modal */}
            {selectedRequest && (
              <div className="admin-modal-overlay" onClick={() => setSelectedRequest(null)}>
                <div className="admin-modal" onClick={e => e.stopPropagation()}>
                  <button className="admin-modal-close" onClick={() => setSelectedRequest(null)}>×</button>
                  <div className="admin-modal-header">
                    <h3>📋 Request Details</h3>
                    <p className="admin-emp-id-lg">{selectedRequest.ticketId}</p>
                  </div>
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
                      <>
                        <h4 style={{ margin: '1rem 0 0.5rem', fontSize: '13px', color: '#374151' }}>Submitted Data</h4>
                        {Object.entries(selectedRequest.formData).map(([key, val]) => (
                          <div className="admin-detail-row" key={key}>
                            <span className="admin-detail-label">{key}</span>
                            <span className="admin-detail-value">{val}</span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                  <div className="admin-modal-actions">
                    <button className="admin-btn-success" onClick={() => { updateRequestStatus(selectedRequest.ticketId, 'Resolved'); setSelectedRequest(null); }}>
                      ✅ Resolve
                    </button>
                    <button className="admin-btn-warning" onClick={() => { updateRequestStatus(selectedRequest.ticketId, 'In Progress'); setSelectedRequest(null); }}>
                      🔄 In Progress
                    </button>
                    <button className="admin-btn-danger" onClick={() => { updateRequestStatus(selectedRequest.ticketId, 'Rejected'); setSelectedRequest(null); }}>
                      ❌ Reject
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════ DATABASE TAB ═══════════ */}
        {activeTab === 'database' && (
          <div className="admin-database">
            <div className="admin-db-section">
              <h3>🗄️ Users Table <span className="admin-db-count">({users.length} records)</span></h3>
              <div className="admin-db-table-wrap">
                <table className="admin-table admin-table-db">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Employee ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td><code>{u.employeeId}</code></td>
                        <td>{u.name}</td>
                        <td>{u.gmail}</td>
                        <td>{u.isAdmin ? <span className="status-badge status-admin">Admin</span> : 'Employee'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="admin-db-section">
              <h3>📋 Requests Table <span className="admin-db-count">({requests.length} records)</span></h3>
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
                📥 Export Full Database (JSON)
              </button>
              <button className="admin-btn-danger" onClick={() => {
                if (window.confirm('⚠️ Clear ALL requests? This cannot be undone.')) {
                  onUpdateRequests([]);
                }
              }}>
                🗑️ Clear All Requests
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
