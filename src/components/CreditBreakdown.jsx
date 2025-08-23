// src/components/CreditBreakdown.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function CreditBreakdown({ categories = [], enrolledSubjects = [] }) {
  return (
    <div className="credit-breakdown card">
      <h2>Credit Breakdown</h2>
      {categories.map(category => {
        const categorySlug = category.name.replace(/\s+/g, '-').toLowerCase();
        
        const subjectsInCategory = enrolledSubjects.filter(
          subject => subject.category === category.name
        );
        
        const completedCredits = subjectsInCategory
          .filter(subject => subject.status === 'completed')
          .reduce((total, subject) => total + subject.credits, 0);

        const ongoingCredits = subjectsInCategory
          .filter(subject => subject.status === 'ongoing')
          .reduce((total, subject) => total + subject.credits, 0);
        
        const partiallyCompletedCredits = subjectsInCategory
          .filter(subject => subject.status === 'partially-completed')
          .reduce((total, subject) => total + subject.credits, 0);

        const required = category.requiredCredits;
        const completedPercent = required > 0 ? (completedCredits / required) * 100 : 0;
        const ongoingPercent = required > 0 ? (ongoingCredits / required) * 100 : 0;
        const partiallyCompletedPercent = required > 0 ? (partiallyCompletedCredits / required) * 100 : 0;

        return (
          <Link to={`/category/${categorySlug}`} key={category.name} className="category-link">
            <div className="category-item">
              <div className="category-header">
                {/* The text only shows fully completed credits */}
                <span>{category.name} ({completedCredits} / {required})</span>
                <span className="view-arrow">→</span>
              </div>
              
              <div className="segmented-bar-container">
                <div className="bar-segment completed" title={`Completed: ${completedCredits} credits`} style={{ width: `${completedPercent}%` }}></div>
                <div className="bar-segment partially-completed" title={`Partially Completed: ${partiallyCompletedCredits} credits`} style={{ width: `${partiallyCompletedPercent}%` }}></div>
                <div className="bar-segment ongoing" title={`Ongoing: ${ongoingCredits} credits`} style={{ width: `${ongoingPercent}%` }}></div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default CreditBreakdown;
