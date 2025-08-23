// src/components/SummaryCards.jsx
import React from 'react';

function SummaryCards({ summary }) {
  // Calculate the progress percentage for the bar
  const progress = summary.totalCredits > 0 ? (summary.earnedCredits / summary.totalCredits) * 100 : 0;
  
  return (
    // This parent div uses the "summary-cards" class to create the grid layout
    <div className="summary-cards">
      {/* First card for Credits Earned */}
      <div className="card">
        <h3>Total Credits Earned</h3>
        <p>{summary.earnedCredits} / {summary.totalCredits}</p>
        {/* This is the progress bar that was missing */}
        <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
      
      {/* Second card for CGPA */}
      <div className="card">
        <h3>Current CGPA</h3>
        <p className="cgpa">{summary.cgpa}</p>
      </div>
    </div>
  );
}

export default SummaryCards;
