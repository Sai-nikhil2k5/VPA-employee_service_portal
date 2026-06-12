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

const Navbar = ({ onNavigate, currentUser, onLogout, onRequestClick }) => {
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
          <div className="nav-requests-wrapper" ref={dropdownRef}>
            <button 
              className={`nav-link requests-trigger ${requestsOpen ? 'active' : ''}`}
              onClick={() => setRequestsOpen(!requestsOpen)}
            >
              Requests
              <svg className={`chevron ${requestsOpen ? 'rotated' : ''}`} width="10" height="6" viewBox="0 0 10 6" fill="none">
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {requestsOpen && (
              <div className="mega-dropdown">
                <div className="mega-dropdown-header">
                  <span className="mega-title">Service Request Categories</span>
                  <span className="mega-subtitle">Select a category and sub-request to get started</span>
                </div>
                <div className="mega-grid">
                  {CATEGORIES.map(cat => (
                    <div key={cat.id} className="mega-category">
                      <div className="mega-cat-header">
                        <span className="mega-cat-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>{getIcon(cat.id)}</span>
                        <span className="mega-cat-name">{cat.name}</span>
                      </div>
                      <div className="mega-cat-items">
                        {cat.subRequests.map((sub, i) => (
                          <button
                            key={i}
                            className="mega-item"
                            onClick={() => handleSubClick(cat, sub)}
                          >
                            <span className="mega-dot"></span>
                            {sub}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
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