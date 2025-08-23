// src/components/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import AuthDetails from './AuthDetails.jsx';

function Header({ studentProfile }) {
  return (
    <header className="header">
      <div className="logo">My Academic Dashboard</div>
      <div className="header-right">
        <Link to="/profile" className="user-info-link">
          <div className="user-info">
            {/* Use optional chaining (?.) to prevent errors while data is loading */}
            <span>{studentProfile?.name}</span>
            <span>{studentProfile?.regNo}</span>
          </div>
        </Link>
        <AuthDetails />
      </div>
    </header>
  );
}

export default Header;
