import React, { useState, useRef, useEffect } from 'react';
import logoUrl from '../assets/logo.png';

const getIcon = (id) => {
  switch (id) {
    case 'email':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}>
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
      );
    case 'personal':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      );
    case 'eoffice':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}>
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
        </svg>
      );
    case 'website':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}>
          <circle cx="12" cy="12" r="10"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      );
    default:
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
      );
  }
};

const CATEGORIES = [
  { id: 'email', name: 'Email Services', subRequests: ['Email Updation', 'Email Recreation'] },
  { id: 'personal', name: 'Personal Details', subRequests: ['Name Change', 'Designation Update', 'Contact Details', 'Aadhaar Change'] },
  { id: 'eoffice', name: 'E-Office', subRequests: ['File Requests', 'Office Correspondence'] },
  { id: 'website', name: 'Website', subRequests: ['Content Update', 'Bug Report', 'Feedback'] },
  { id: 'others', name: 'Others', subRequests: ['My Requests', 'Track Request', 'Other Services'] }
];

const Navbar = ({ onNavigate, currentUser, onLogout, onRequestClick, onOpenSettings, onRefresh }) => {
  const [requestsOpen, setRequestsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setRequestsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubClick = (category, sub) => {
    setRequestsOpen(false);
    setMobileOpen(false);
    if (onRequestClick) {
      onRequestClick(category, sub);
    }
  };

  const handleNavClick = (page) => {
    setMobileOpen(false);
    setRequestsOpen(false);
    onNavigate(page);
  };

  return (
    <nav>
      <div className="nav-logo" onClick={() => handleNavClick('home')} style={{ cursor: 'pointer' }}>
        <img src={logoUrl} alt="VPA Logo" className="logo-image" />
        <div>
          <div className="logo-text">Visakhapatnam Port Authority</div>
          <div className="logo-sub">Employee Services Portal</div>
        </div>
      </div>

      {/* HAMBURGER TOGGLE */}
      <button 
        className={`hamburger ${mobileOpen ? 'active' : ''}`} 
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        <span></span><span></span><span></span>
      </button>

      {/* NAVIGATION MENU */}
      <div className={`nav-menu ${mobileOpen ? 'open' : ''}`}>
        <button className="nav-link" onClick={() => handleNavClick('home')}>
          Home
        </button>
        {currentUser && currentUser.isAdmin && (
          <button className="nav-link" onClick={() => handleNavClick('admin')}>
            Control Panel
          </button>
        )}

        {/* REQUESTS MEGA DROPDOWN */}
        {!currentUser?.isAdmin && (
          <button 
            className="nav-link" 
            onClick={() => handleSubClick(CATEGORIES.find(c => c.id === 'others'), 'My Requests')}
          >
            My Requests
          </button>
        )}

        <button className="nav-link" onClick={() => {
          setMobileOpen(false);
          const el = document.getElementById('how-it-works-sec');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
          else handleNavClick('home');
        }}>
          About
        </button>
      </div>

      {/* AUTH ACTIONS */}
      <div className="nav-actions">
        {currentUser ? (
          <>
            <span className="user-welcome">
              <span className="user-avatar">{currentUser.name.charAt(0).toUpperCase()}</span>
              <span className="user-name-text">
                {currentUser.name}{currentUser.isAdmin && <span className="admin-badge">Admin</span>}
              </span>
            </span>
            <button 
              onClick={onRefresh}
              style={{ 
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px',
                borderRadius: '50%',
                marginRight: '8px',
                color: 'var(--navy)'
              }}
              title="Refresh Data"
              onMouseOver={(e) => e.currentTarget.style.background = 'var(--grey-200)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-9.21l-3.25 3.14"/>
              </svg>
            </button>
            {!currentUser.isAdmin && (
              <button 
                className="btn-outline" 
                onClick={onOpenSettings}
                style={{ marginRight: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}>
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
                Settings
              </button>
            )}
            <button className="btn-outline" onClick={onLogout}>Log Out</button>
          </>
        ) : (
          <>
            <button className="btn-outline" onClick={() => handleNavClick('login')}>Log In</button>
            <button className="btn-solid" onClick={() => handleNavClick('signup')}>Sign Up</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;