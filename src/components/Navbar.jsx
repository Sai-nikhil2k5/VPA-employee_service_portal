import React, { useState, useRef, useEffect } from 'react';
import logoUrl from '../assets/logo.png';

const CATEGORIES = [
  { id: 'email', name: 'Email Services', icon: '📧', subRequests: ['Email Creation', 'Email Updation', 'Email Recreation'] },
  { id: 'personal', name: 'Personal Details', icon: '👤', subRequests: ['Name Change', 'Designation Update', 'Contact Details'] },
  { id: 'eoffice', name: 'E-Office', icon: '🗂️', subRequests: ['File Requests', 'Office Correspondence'] },
  { id: 'website', name: 'Website', icon: '🌐', subRequests: ['Content Update', 'Bug Report', 'Feedback'] },
  { id: 'others', name: 'Others', icon: '📋', subRequests: ['My Requests', 'Track Request', 'Other Services'] }
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

        {/* REQUESTS MEGA DROPDOWN */}
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
                      <span className="mega-cat-icon">{cat.icon}</span>
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