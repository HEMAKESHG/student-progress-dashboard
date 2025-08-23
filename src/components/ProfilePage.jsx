// src/components/ProfilePage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function ProfilePage({ studentProfile, onReset }) {
  // Add state to track the confirmation step
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirmReset = () => {
    onReset(); // Call the main reset function from App.jsx
    setIsConfirming(false); // Hide the confirmation buttons after reset
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <Link to="/" className="back-link">← Back to Dashboard</Link>
        <h2>My Profile</h2>
      </div>
      <div className="card">
        <p><strong>Name:</strong> {studentProfile.name}</p>
        <p><strong>Registration No:</strong> {studentProfile.regNo}</p>
        <p><strong>Program:</strong> {studentProfile.program}</p>
      </div>

      {/* The new Danger Zone section with inline confirmation */}
      <div className="danger-zone">
        <h4>Danger Zone</h4>
        <div className="danger-zone-item">
          <div>
            <strong>Reset All Data</strong>
            <p>This will permanently delete all your enrolled subjects. This action cannot be undone.</p>
          </div>

          {/* Conditionally render buttons based on the confirmation state */}
          {!isConfirming ? (
            <button onClick={() => setIsConfirming(true)} className="danger-btn">
              Reset Data
            </button>
          ) : (
            <div className="danger-zone-confirm">
              <button onClick={() => setIsConfirming(false)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleConfirmReset} className="danger-btn">
                Confirm Reset
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
