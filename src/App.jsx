import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AdminDashboard from './components/AdminDashboard';
import logoUrl from './assets/logo.png';
import Footer from './components/Footer';
import './index.css';
import heroImg1 from './assets/hero-1.jpg';
import heroImg2 from './assets/hero-2.png';
import heroImg3 from './assets/hero-3.png';

const HERO_IMAGES = [heroImg1, heroImg2, heroImg3];

const CATEGORIES = [
  {
    id: 'email',
    name: 'Email Services',
    icon: '📧',
    desc: 'Manage your official VPA email credentials and access.',
    subRequests: ['Email Creation', 'Email Updation', 'Email Recreation']
  },
  {
    id: 'personal',
    name: 'Personal Details',
    icon: '👤',
    desc: 'Update your employee profile and contact information.',
    subRequests: ['Name Change', 'Designation Update', 'Contact Details']
  },
  {
    id: 'eoffice',
    name: 'E-Office',
    icon: '🗂️',
    desc: 'Digital file and correspondence management requests.',
    subRequests: ['File Requests', 'Office Correspondence']
  },
  {
    id: 'website',
    name: 'Website',
    icon: '🌐',
    desc: "Requests related to VPA's official website content.",
    subRequests: ['Content Update', 'Bug Report', 'Feedback']
  },
  {
    id: 'others',
    name: 'Others',
    icon: '📋',
    desc: 'Track existing requests or raise new unspecified ones.',
    subRequests: ['My Requests', 'Track Request', 'Other Services']
  }
];

function App() {
  // Navigation & Auth States
  const [currentPage, setCurrentPage] = useState('home'); // 'home' | 'login' | 'signup'
  const [authMode, setAuthMode] = useState('employee'); // 'employee' | 'admin'
  const [currentUser, setCurrentUser] = useState(null);

  // Modal / Request Flow States
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubRequest, setSelectedSubRequest] = useState('');
  const [formData, setFormData] = useState({});
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [showToast, setShowToast] = useState('');
  const [heroSlide, setHeroSlide] = useState(0);

  // Auto-cycle hero slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroSlide(prev => (prev + 1) % HERO_IMAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Form input validation errors
  const [authErrors, setAuthErrors] = useState({});
  const [formErrors, setFormErrors] = useState({});

  // Local storage db arrays
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);

  // Load database on mount
  useEffect(() => {
    const savedUsers = JSON.parse(localStorage.getItem('vpa_users')) || [];
    const savedRequests = JSON.parse(localStorage.getItem('vpa_requests')) || [];
    const loggedInUser = JSON.parse(localStorage.getItem('vpa_logged_in_user'));
    
    setUsers(savedUsers);
    setRequests(savedRequests);
    if (loggedInUser) {
      setCurrentUser(loggedInUser);
    }
  }, []);

  // Sync state helpers
  const saveUsers = (newUsersList) => {
    setUsers(newUsersList);
    localStorage.setItem('vpa_users', JSON.stringify(newUsersList));
  };

  const saveRequests = (newRequestsList) => {
    setRequests(newRequestsList);
    localStorage.setItem('vpa_requests', JSON.stringify(newRequestsList));
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
    setAuthErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('vpa_logged_in_user');
    setCurrentPage('home');
    triggerToast('Logged out successfully.');
  };

  const triggerToast = (msg) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(''), 3000);
  };

  // Auth Submit Handlers
  const handleSignUpSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const employeeId = fd.get('employeeId').trim();
    const name = fd.get('name').trim();
    const gmail = fd.get('gmail').trim();
    const password = fd.get('password');

    const errors = {};
    if (!employeeId) errors.employeeId = 'Employee ID is required';
    if (!name) errors.name = 'Full Name is required';
    if (!gmail) {
      errors.gmail = 'Gmail address is required';
    } else if (!gmail.endsWith('@gmail.com') && !gmail.includes('@')) {
      errors.gmail = 'Please enter a valid email address';
    }
    if (!password || password.length < 6) errors.password = 'Password must be at least 6 characters';

    // Check duplicate
    if (users.some(u => u.employeeId.toLowerCase() === employeeId.toLowerCase())) {
      errors.employeeId = 'Employee ID already registered';
    }

    if (Object.keys(errors).length > 0) {
      setAuthErrors(errors);
      return;
    }

    const newUser = { employeeId, name, gmail, password, isAdmin: false };
    const updatedUsers = [...users, newUser];
    saveUsers(updatedUsers);

    // Auto-login
    setCurrentUser(newUser);
    localStorage.setItem('vpa_logged_in_user', JSON.stringify(newUser));
    triggerToast(`Welcome ${name}! Sign up successful.`);
    handleNavigate('home');
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const userId = fd.get('userId').trim();
    const password = fd.get('password');

    const errors = {};
    if (!userId) errors.userId = 'User ID is required';
    if (!password) errors.password = 'Password is required';

    if (Object.keys(errors).length > 0) {
      setAuthErrors(errors);
      return;
    }

    if (authMode === 'admin') {
      // Admin Login Check
      if (userId === 'admin' && password === 'admin123') {
        const adminUser = { employeeId: 'admin', name: 'System Administrator', gmail: 'admin@vpa.gov.in', isAdmin: true };
        setCurrentUser(adminUser);
        localStorage.setItem('vpa_logged_in_user', JSON.stringify(adminUser));
        triggerToast('Logged in as Administrator');
        handleNavigate('admin');
      } else {
        setAuthErrors({ userId: 'Invalid Administrator credentials' });
      }
    } else {
      // Employee Login Check
      const foundUser = users.find(u => u.employeeId.toLowerCase() === userId.toLowerCase() && u.password === password);
      if (foundUser) {
        setCurrentUser(foundUser);
        localStorage.setItem('vpa_logged_in_user', JSON.stringify(foundUser));
        triggerToast(`Welcome back, ${foundUser.name}!`);
        handleNavigate('home');
      } else {
        setAuthErrors({ userId: 'Invalid Employee ID or Password' });
      }
    }
  };

  // Service Click Handler — toggles inline expansion of sub-requests
  // (No login required to BROWSE, only to SUBMIT)
  const handleServiceCardClick = (category) => {
    setExpandedCategory(expandedCategory === category.id ? null : category.id);
  };

  // Opens modal directly for a given category + sub-request
  const openSubRequestModal = (category, subReq) => {
    if (!currentUser) {
      triggerToast('Please log in first to raise or view service requests.');
      handleNavigate('login');
      return;
    }
    setSelectedCategory(category);
    setSelectedSubRequest(subReq);
    setFormData({});
    setSubmittedTicket(null);
    setFormErrors({});
  };

  // Called from Navbar mega-dropdown
  const handleNavRequestClick = (category, subReq) => {
    if (!currentUser) {
      triggerToast('Please log in first to raise or view service requests.');
      handleNavigate('login');
      return;
    }
    setCurrentPage('home');
    openSubRequestModal(category, subReq);
  };

  const closeRequestModal = () => {
    setSelectedCategory(null);
    setSelectedSubRequest('');
    setFormData({});
    setSubmittedTicket(null);
  };

  // Dynamic Form Field Selector
  const getFormFields = (subReq) => {
    switch (subReq) {
      case 'Email Creation':
        return [
          { label: 'Full Name', name: 'fullName', type: 'text', placeholder: 'Enter official name', required: true },
          { label: 'Designation', name: 'designation', type: 'text', placeholder: 'e.g. Senior Accounts Officer', required: true },
          { label: 'Department', name: 'department', type: 'text', placeholder: 'e.g. Finance Department', required: true },
          { label: 'Preferred Email Prefix', name: 'prefix', type: 'text', placeholder: 'e.g. john.doe (will become john.doe@vpa.gov.in)', required: true },
          { label: 'Justification / Reason for Email', name: 'reason', type: 'textarea', placeholder: 'State the official work requirement', required: true }
        ];
      case 'Email Updation':
        return [
          { label: 'Current VPA Email ID', name: 'email', type: 'email', placeholder: 'e.g. name@vpa.gov.in', required: true },
          { label: 'Contact Mobile', name: 'mobile', type: 'text', placeholder: '10-digit mobile number', required: true },
          { label: 'Update Description', name: 'details', type: 'textarea', placeholder: 'Describe updates (e.g. password resets, storage upgrades, display name changes)', required: true }
        ];
      case 'Email Recreation':
        return [
          { label: 'Former VPA Email ID', name: 'email', type: 'email', placeholder: 'e.g. former.name@vpa.gov.in', required: true },
          { label: 'Reason for Recreation', name: 'reason', type: 'textarea', placeholder: 'Brief explanation for recreating the inbox', required: true }
        ];
      case 'Name Change':
        return [
          { label: 'Current Registered Name', name: 'oldName', type: 'text', required: true },
          { label: 'Proposed New Name', name: 'newName', type: 'text', placeholder: 'New name as in Gazette Notification', required: true },
          { label: 'Aadhar Card Number', name: 'govtId', type: 'text', placeholder: '12-digit UIDAI number', required: true },
          { label: 'Reason for Name Modification', name: 'reason', type: 'textarea', placeholder: 'Reason / gazette notification details', required: true }
        ];
      case 'Designation Update':
        return [
          { label: 'Current Registered Designation', name: 'oldDesignation', type: 'text', required: true },
          { label: 'New Designation', name: 'newDesignation', type: 'text', required: true },
          { label: 'Office Promotion / Transfer Order Number', name: 'orderRef', type: 'text', placeholder: 'Reference order number', required: true },
          { label: 'Effective Date', name: 'date', type: 'date', required: true }
        ];
      case 'Contact Details':
        return [
          { label: 'Personal Mobile Number', name: 'mobile', type: 'text', placeholder: '10-digit mobile', required: true },
          { label: 'Emergency Contact Person', name: 'emergencyContact', type: 'text', placeholder: 'Full Name', required: true },
          { label: 'Emergency Contact Number', name: 'emergencyMobile', type: 'text', placeholder: '10-digit mobile', required: true },
          { label: 'Current Residential Address', name: 'address', type: 'textarea', placeholder: 'Complete current residential address', required: true }
        ];
      case 'File Requests':
        return [
          { label: 'File Subject / Title', name: 'fileName', type: 'text', placeholder: 'Name or subject of e-file', required: true },
          { label: 'E-Office Module / Department', name: 'fileType', type: 'select', options: ['Administration', 'Finance', 'Traffic', 'Marine', 'Engineering', 'Medical'], required: true },
          { label: 'Required Permission Level', name: 'permission', type: 'select', options: ['Read-only Access', 'Edit / Drafting Access', 'Approval Access'], required: true },
          { label: 'Purpose of Access', name: 'purpose', type: 'textarea', placeholder: 'Explain official file access requirement', required: true }
        ];
      case 'Office Correspondence':
        return [
          { label: 'Subject of Correspondence', name: 'subject', type: 'text', placeholder: 'Subject line of letter/note', required: true },
          { label: 'Recipient Authority', name: 'recipient', type: 'text', placeholder: 'e.g. Deputy Chairman, VPA', required: true },
          { label: 'Correspondence Content / Draft', name: 'body', type: 'textarea', placeholder: 'Type letter body or notes here...', required: true }
        ];
      case 'Content Update':
      case 'Bug Report':
      case 'Feedback':
        return [
          { label: 'Portal Section / URL', name: 'section', type: 'text', placeholder: 'e.g. /home or Service Category Grid', required: true },
          { label: 'Subject Line', name: 'subject', type: 'text', required: true },
          { label: 'Details of Issue or Change', name: 'description', type: 'textarea', placeholder: 'Detailed description...', required: true }
        ];
      default:
        return [
          { label: 'Request Subject', name: 'subject', type: 'text', placeholder: 'Summary of request', required: true },
          { label: 'Details', name: 'description', type: 'textarea', placeholder: 'Provide complete details', required: true }
        ];
    }
  };

  // Submit Request Handler
  const handleRequestSubmit = (e) => {
    e.preventDefault();
    const fields = getFormFields(selectedSubRequest);
    const errors = {};
    const data = {};

    fields.forEach(f => {
      const val = formData[f.name] || '';
      if (f.required && !val.trim()) {
        errors[f.name] = `${f.label} is required`;
      }
      data[f.name] = val;
    });

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const ticketId = `VPA-REQ-${Math.floor(10000 + Math.random() * 90000)}`;
    const newRequest = {
      id: ticketId,
      employeeId: currentUser.employeeId,
      employeeName: currentUser.name,
      category: selectedCategory.name,
      subRequest: selectedSubRequest,
      date: new Date().toLocaleDateString(),
      status: 'Pending',
      details: data
    };

    const updatedRequests = [newRequest, ...requests];
    saveRequests(updatedRequests);
    setSubmittedTicket(ticketId);
    setFormData({});
  };

  // Admin approval/rejection handler
  const handleUpdateRequestStatus = (requestId, status) => {
    const updated = requests.map(req => {
      if (req.id === requestId) {
        return { ...req, status };
      }
      return req;
    });
    saveRequests(updated);
    triggerToast(`Request ${requestId} status updated to: ${status}`);
  };

  return (
    <div className="app-container">
      <Navbar 
        onNavigate={handleNavigate} 
        currentUser={currentUser} 
        onLogout={handleLogout}
        onRequestClick={handleNavRequestClick}
      />

      {/* TOAST SYSTEM */}
      {showToast && (
        <div style={{
          position: 'fixed', bottom: '20px', right: '20px',
          background: 'var(--navy)', color: 'white',
          padding: '12px 24px', borderRadius: '8px', zIndex: 2000,
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)', fontSize: '13px',
          fontWeight: 500, animation: 'fadeIn 0.2s ease'
        }}>
          {showToast}
        </div>
      )}

      {/* HOME PAGE VIEW */}
      {currentPage === 'home' && (
        <>
          {/* HERO SECTION WITH SLIDING IMAGES */}
          <section className="hero">
            {/* Sliding Background Images */}
            <div className="hero-slideshow">
              {HERO_IMAGES.map((img, idx) => (
                <div
                  key={idx}
                  className={`hero-slide ${heroSlide === idx ? 'active' : ''}`}
                  style={{ backgroundImage: `url(${img})` }}
                />
              ))}
              <div className="hero-overlay" />
            </div>

            {/* Content */}
            <div className="hero-content">
              <div className="hero-badge">
                <span className="pulse"></span>
                Official Employee Portal
              </div>
              <h1>Visakhapatnam<br/><span>Port Authority</span></h1>
              <h2>Employee Portal</h2>
              <p>A unified platform for VPA employees to raise service requests, manage personal information, and track approvals — all in one place.</p>
              <div className="hero-cta">
                <button 
                  className="cta-primary"
                  onClick={() => currentUser ? handleServiceCardClick(CATEGORIES[0]) : handleNavigate('login')}
                >
                  {currentUser ? 'Raise a Request' : 'Access Your Portal'}
                </button>
                <button 
                  className="cta-secondary"
                  onClick={() => {
                    const sectionEl = document.getElementById('how-it-works-sec');
                    if (sectionEl) sectionEl.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Learn More
                </button>
              </div>

              {/* Slide indicators */}
              <div className="hero-dots">
                {HERO_IMAGES.map((_, idx) => (
                  <button
                    key={idx}
                    className={`hero-dot ${heroSlide === idx ? 'active' : ''}`}
                    onClick={() => setHeroSlide(idx)}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* STATS STRIP */}
          <div className="stats-strip">
            <div className="stat-item">
              <div className="stat-num">5,000+</div>
              <div className="stat-label">Employees Registered</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">{CATEGORIES.length * 3 - 3}</div>
              <div className="stat-label">Request Categories</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">48hr</div>
              <div className="stat-label">Avg. Resolution Time</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">100%</div>
              <div className="stat-label">Secure & Encrypted</div>
            </div>
          </div>

          {/* SCROLLING ANNOUNCEMENTS BANNER */}
          <div className="scroll-banner">
            <div className="scroll-track">
              <div className="scroll-item"><span className="divider"></span>System maintenance scheduled on 15th June 2026 from 10 PM – 2 AM</div>
              <div className="scroll-item"><span className="divider"></span>Email recreation requests now processed within 24 hours</div>
              <div className="scroll-item"><span className="divider"></span>New personal details update form is now live</div>
              <div className="scroll-item"><span className="divider"></span>E-Office integration updated — please re-link your credentials</div>
              <div className="scroll-item"><span className="divider"></span>All pending requests from May have been cleared</div>
              {/* Duplicated for smooth scrolling loop */}
              <div className="scroll-item"><span className="divider"></span>System maintenance scheduled on 15th June 2026 from 10 PM – 2 AM</div>
              <div className="scroll-item"><span className="divider"></span>Email recreation requests now processed within 24 hours</div>
              <div className="scroll-item"><span className="divider"></span>New personal details update form is now live</div>
              <div className="scroll-item"><span className="divider"></span>E-Office integration updated — please re-link your credentials</div>
              <div className="scroll-item"><span className="divider"></span>All pending requests from May have been cleared</div>
            </div>
          </div>

          {/* SERVICES SECTION */}
          <section className="section" style={{ background: 'var(--grey-100)', textAlign: 'center' }}>
            <div className="section-title">Request Services</div>
            <div className="section-sub">Choose a category to view available sub-requests</div>
            
            <div className="services-grid">
              {CATEGORIES.map(category => (
                <div 
                  key={category.id} 
                  className={`service-card ${expandedCategory === category.id ? 'expanded' : ''}`}
                >
                  <div className="service-card-top" onClick={() => handleServiceCardClick(category)}>
                    <div className="service-icon">{category.icon}</div>
                    <h3>{category.name}</h3>
                    <p>{category.desc}</p>
                    <span className="service-expand-arrow">{expandedCategory === category.id ? '▲' : '▼'}</span>
                  </div>

                  {expandedCategory === category.id && (
                    <div className="service-sub-actions">
                      <div className="sub-actions-label">Select a sub-request:</div>
                      {category.subRequests.map((sub, i) => (
                        <button
                          key={i}
                          className="sub-action-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            openSubRequestModal(category, sub);
                          }}
                        >
                          <span className="sub-action-dot"></span>
                          {sub}
                          <span className="sub-action-go">→</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* HOW IT WORKS */}
          <section id="how-it-works-sec" className="section highlight-section" style={{ textAlign: 'center' }}>
            <div className="section-title">How It Works</div>
            <div className="section-sub">Four simple steps to get your request resolved</div>
            <div className="steps-row">
              <div className="step-item">
                <div className="step-circle">1</div>
                <h4>Login</h4>
                <p>Sign in with your employee credentials</p>
              </div>
              <div className="step-item">
                <div className="step-circle">2</div>
                <h4>Submit Request</h4>
                <p>Choose category and fill in the form</p>
              </div>
              <div className="step-item">
                <div className="step-circle">3</div>
                <h4>Get Ticket</h4>
                <p>Receive a random ticket number via email</p>
              </div>
              <div className="step-item">
                <div className="step-circle">4</div>
                <h4>Resolved</h4>
                <p>Admin reviews and closes your request</p>
              </div>
            </div>
          </section>
        </>
      )}

      {/* LOGIN VIEW */}
      {currentPage === 'login' && (
        <div className="auth-container">
          <div className="auth-card auth-split">
            {/* LEFT BRANDING PANEL */}
            <div className="auth-brand-panel">
              <img src={logoUrl} alt="VPA Logo" className="auth-brand-logo-img" />
              <h2>Welcome Back</h2>
              <p>Access your VPA employee portal to manage requests, track approvals, and stay connected.</p>
              <div className="auth-brand-features">
                <div className="auth-feature"><span>✓</span> Raise service requests instantly</div>
                <div className="auth-feature"><span>✓</span> Track request status in real-time</div>
                <div className="auth-feature"><span>✓</span> Manage your official profile</div>
                <div className="auth-feature"><span>✓</span> Secure & encrypted portal</div>
              </div>
            </div>

            {/* RIGHT FORM PANEL */}
            <div className="auth-form-panel">
              <div className="auth-form-header">
                <h3>Sign In</h3>
                <p>Enter your credentials to continue</p>
              </div>

              <div className="auth-tabs">
                <button 
                  type="button" 
                  className={`auth-tab ${authMode === 'employee' ? 'active' : ''}`}
                  onClick={() => { setAuthMode('employee'); setAuthErrors({}); }}
                >
                  👤 Employee
                </button>
                <button 
                  type="button" 
                  className={`auth-tab ${authMode === 'admin' ? 'active' : ''}`}
                  onClick={() => { setAuthMode('admin'); setAuthErrors({}); }}
                >
                  🔑 Admin
                </button>
              </div>

              {authMode === 'admin' && (
                <div className="auth-admin-notice">
                  <span>🛡️</span> Administrator access — restricted to authorized IT personnel only.
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="auth-form">
                <div className="form-group">
                  <label>{authMode === 'admin' ? 'Admin Username' : 'Employee ID / User ID'}</label>
                  <input 
                    type="text" 
                    name="userId" 
                    placeholder={authMode === 'admin' ? 'e.g. admin' : 'e.g. VPA-10493'}
                    required 
                  />
                  {authErrors.userId && <span className="form-error">{authErrors.userId}</span>}
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <input 
                    type="password" 
                    name="password" 
                    placeholder="••••••••"
                    required 
                  />
                  {authErrors.password && <span className="form-error">{authErrors.password}</span>}
                </div>

                <button type="submit" className="btn-submit">
                  {authMode === 'admin' ? '🔑 Sign In as Admin' : 'Sign In to Portal'}
                </button>

                {authMode === 'employee' && (
                  <div className="auth-switch">
                    New employee? <span onClick={() => handleNavigate('signup')}>Create your account</span>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}

      {/* SIGNUP VIEW */}
      {currentPage === 'signup' && (
        <div className="auth-container">
          <div className="auth-card auth-split">
            {/* LEFT BRANDING PANEL */}
            <div className="auth-brand-panel">
              <img src={logoUrl} alt="VPA Logo" className="auth-brand-logo-img" />
              <h2>Join the Portal</h2>
              <p>Register as a new VPA employee to access all service request capabilities.</p>
              <div className="auth-brand-features">
                <div className="auth-feature"><span>①</span> Enter your Employee ID</div>
                <div className="auth-feature"><span>②</span> Provide your name & email</div>
                <div className="auth-feature"><span>③</span> Create a secure password</div>
                <div className="auth-feature"><span>④</span> Start raising requests!</div>
              </div>
            </div>

            {/* RIGHT FORM PANEL */}
            <div className="auth-form-panel">
              <div className="auth-form-header">
                <h3>New Employee Registration</h3>
                <p>Create your portal account</p>
              </div>
            
              <form onSubmit={handleSignUpSubmit} className="auth-form">
                <div className="form-group">
                  <label>Employee ID</label>
                  <input 
                    type="text" 
                    name="employeeId" 
                    placeholder="e.g. VPA-10493"
                    required 
                  />
                  {authErrors.employeeId && <span className="form-error">{authErrors.employeeId}</span>}
                </div>

                <div className="form-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    placeholder="e.g. John Doe"
                    required 
                  />
                  {authErrors.name && <span className="form-error">{authErrors.name}</span>}
                </div>

                <div className="form-group">
                  <label>Gmail Address</label>
                  <input 
                    type="email" 
                    name="gmail" 
                    placeholder="e.g. john.doe@gmail.com"
                    required 
                  />
                  {authErrors.gmail && <span className="form-error">{authErrors.gmail}</span>}
                </div>

                <div className="form-group">
                  <label>Create Password</label>
                  <input 
                    type="password" 
                    name="password" 
                    placeholder="Minimum 6 characters"
                    required 
                  />
                  {authErrors.password && <span className="form-error">{authErrors.password}</span>}
                </div>

                <button type="submit" className="btn-submit">Create Portal Account</button>

                <div className="auth-switch">
                  Already registered? <span onClick={() => handleNavigate('login')}>Sign In</span>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN DASHBOARD VIEW */}
      {currentPage === 'admin' && currentUser?.isAdmin && (
        <AdminDashboard
          users={users}
          requests={requests}
          onUpdateRequests={saveRequests}
          onUpdateUsers={saveUsers}
          onNavigateHome={() => handleNavigate('home')}
        />
      )}

      {/* FULL-FLEDGED INTERACTIVE MODAL FOR SUB-REQUESTS */}
      {selectedCategory && (
        <div className="modal-backdrop" onClick={closeRequestModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {selectedCategory.icon} {selectedCategory.name}
              </h2>
              <button className="modal-close" onClick={closeRequestModal}>×</button>
            </div>

            <div className="modal-body">
              {/* SIDEBAR FOR SUB-REQUEST CHOICES */}
              <div className="modal-sidebar">
                <div className="sidebar-title">Sub-Requests</div>
                {selectedCategory.subRequests.map((sub, i) => (
                  <button
                    key={i}
                    className={`subrequest-item ${selectedSubRequest === sub ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedSubRequest(sub);
                      setSubmittedTicket(null);
                      setFormData({});
                      setFormErrors({});
                    }}
                  >
                    {sub}
                  </button>
                ))}
              </div>

              {/* DYNAMIC FORM / SUBMISSION MAIN VIEW */}
              <div className="modal-main">
                {submittedTicket ? (
                  /* SUCCESS VIEW */
                  <div className="success-card">
                    <div className="success-icon-big">✅</div>
                    <h3>Request Submitted Successfully!</h3>
                    <p>
                      Your <strong>{selectedSubRequest}</strong> request has been raised under Visakhapatnam Port Authority. A confirmation email has been dispatched to {currentUser.gmail}.
                    </p>
                    <div className="ticket-box">
                      {submittedTicket}
                    </div>
                    <p style={{ marginTop: '1.5rem', fontSize: '11px', color: '#888' }}>
                      Keep note of this Ticket ID to track the resolution progress with the portal admin.
                    </p>
                    <button 
                      className="btn-submit" 
                      style={{ maxWidth: '200px', margin: '1rem auto 0' }}
                      onClick={() => setSubmittedTicket(null)}
                    >
                      Raise Another Request
                    </button>
                  </div>
                ) : selectedSubRequest === 'My Requests' || selectedSubRequest === 'Track Request' ? (
                  /* REQUESTS TRACKING DASHBOARD */
                  <div>
                    <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.3rem', color: 'var(--navy)', marginBottom: '1rem' }}>
                      {currentUser.isAdmin ? 'Global Requests Queue' : 'My Service Requests'}
                    </h3>
                    
                    {/* Filter requests */}
                    {(() => {
                      const list = currentUser.isAdmin
                        ? requests
                        : requests.filter(r => r.employeeId === currentUser.employeeId);

                      if (list.length === 0) {
                        return (
                          <div style={{ textAlign: 'center', padding: '3rem 0', color: '#888' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</div>
                            No requests found matching this view.
                          </div>
                        );
                      }

                      return (
                        <div style={{ overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                            <thead>
                              <tr style={{ background: 'var(--grey-100)', borderBottom: '1.5px solid var(--grey-300)' }}>
                                <th style={{ padding: '8px 12px' }}>Ticket ID</th>
                                {currentUser.isAdmin && <th style={{ padding: '8px 12px' }}>Employee</th>}
                                <th style={{ padding: '8px 12px' }}>Type</th>
                                <th style={{ padding: '8px 12px' }}>Sub-Type</th>
                                <th style={{ padding: '8px 12px' }}>Date</th>
                                <th style={{ padding: '8px 12px' }}>Status</th>
                                {currentUser.isAdmin && <th style={{ padding: '8px 12px' }}>Actions</th>}
                              </tr>
                            </thead>
                            <tbody>
                              {list.map((req) => (
                                <tr key={req.id} style={{ borderBottom: '1px solid var(--grey-200)' }}>
                                  <td style={{ padding: '10px 12px', fontWeight: 600 }}>{req.id}</td>
                                  {currentUser.isAdmin && (
                                    <td style={{ padding: '10px 12px' }}>
                                      <strong>{req.employeeName}</strong><br/>
                                      <span style={{ fontSize: '11px', color: '#6b7280' }}>ID: {req.employeeId}</span>
                                    </td>
                                  )}
                                  <td style={{ padding: '10px 12px' }}>{req.category}</td>
                                  <td style={{ padding: '10px 12px' }}>{req.subRequest}</td>
                                  <td style={{ padding: '10px 12px' }}>{req.date}</td>
                                  <td style={{ padding: '10px 12px' }}>
                                    <span style={{
                                      padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600,
                                      background: req.status === 'Approved' ? '#dcfce7' : req.status === 'Rejected' ? '#fee2e2' : '#fef9c3',
                                      color: req.status === 'Approved' ? '#15803d' : req.status === 'Rejected' ? '#b91c1c' : '#a16207'
                                    }}>
                                      {req.status}
                                    </span>
                                  </td>
                                  {currentUser.isAdmin && (
                                    <td style={{ padding: '10px 12px', display: 'flex', gap: '5px' }}>
                                      {req.status === 'Pending' && (
                                        <>
                                          <button 
                                            style={{ padding: '3px 6px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                                            onClick={() => handleUpdateRequestStatus(req.id, 'Approved')}
                                          >
                                            Approve
                                          </button>
                                          <button 
                                            style={{ padding: '3px 6px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                                            onClick={() => handleUpdateRequestStatus(req.id, 'Rejected')}
                                          >
                                            Reject
                                          </button>
                                        </>
                                      )}
                                    </td>
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    })()}
                  </div>
                ) : selectedSubRequest ? (
                  /* REQUEST INTAKE FORM */
                  <form onSubmit={handleRequestSubmit}>
                    <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.3rem', color: 'var(--navy)', marginBottom: '4px' }}>
                      {selectedSubRequest}
                    </h3>
                    <p style={{ fontSize: '11.5px', color: '#6b7280', marginBottom: '1.5rem' }}>
                      Raising request under employee account ID: <strong>{currentUser.employeeId}</strong>
                    </p>

                    {getFormFields(selectedSubRequest).map((field, idx) => (
                      <div key={idx} className="form-group">
                        <label>{field.label} {field.required && '*'}</label>
                        {field.type === 'textarea' ? (
                          <textarea
                            name={field.name}
                            rows={3}
                            placeholder={field.placeholder || ''}
                            value={formData[field.name] || ''}
                            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                          />
                        ) : field.type === 'select' ? (
                          <select
                            name={field.name}
                            value={formData[field.name] || ''}
                            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                          >
                            <option value="">Select option...</option>
                            {field.options.map((opt, oIdx) => (
                              <option key={oIdx} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={field.type}
                            name={field.name}
                            placeholder={field.placeholder || ''}
                            value={formData[field.name] || ''}
                            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                          />
                        )}
                        {formErrors[field.name] && <span className="form-error">{formErrors[field.name]}</span>}
                      </div>
                    ))}

                    <button type="submit" className="btn-submit" style={{ marginTop: '1.5rem' }}>
                      Submit Official Request
                    </button>
                  </form>
                ) : (
                  /* WELCOME SUB-REQUEST VIEW */
                  <div className="subrequest-welcome">
                    <div className="subrequest-welcome-icon">📋</div>
                    <h3>Choose a Sub-Request Option</h3>
                    <p style={{ fontSize: '12.5px', maxWidth: '320px', margin: '0 auto', marginTop: '5px' }}>
                      Select one of the sub-categories in the left sidebar to access specific forms or track request status.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default App;