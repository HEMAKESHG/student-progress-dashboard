// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { departmentRules } from '../data/mockData';
import Header from './Header.jsx';
import SummaryCards from './SummaryCards.jsx';
import CreditBreakdown from './CreditBreakdown.jsx';
import FileUpload from './FileUpload.jsx';

function Dashboard({ student }) {
  const [summary, setSummary] = useState({ earnedCredits: 0, totalCredits: 0, cgpa: 0 });

  useEffect(() => {
    if (!student || !student.department || !departmentRules[student.department]) {
        setSummary({ earnedCredits: 0, totalCredits: 164, cgpa: "0.00" });
        return;
    }
    
    const rules = departmentRules[student.department];
    const completedSubjects = student.enrolledSubjects.filter(s => s.status === 'completed');
    const earnedCredits = completedSubjects.reduce((total, sub) => total + sub.credits, 0);
    
    const totalPoints = completedSubjects.reduce((total, sub) => {
        const gradePoint = sub.gradePoint || 0;
        return total + (gradePoint * sub.credits);
    }, 0);

    const cgpa = earnedCredits > 0 ? (totalPoints / earnedCredits).toFixed(2) : "0.00";

    setSummary({ earnedCredits, totalCredits: rules.totalCredits, cgpa });
  }, [student]);

  console.log('Inspecting student object:', student);

  if (!student) {
    return <div className="loading-screen">Loading dashboard...</div>;
  }
  
  const rules = departmentRules[student.department];

  return (
    <div className="dashboard-container">
      <Header studentProfile={student.profile} />
      <main>
        <SummaryCards summary={summary} />
        {rules ? (
            <CreditBreakdown
              categories={rules.categories}
              enrolledSubjects={student.enrolledSubjects}
            />
        ) : (
            <div className="card">
                <p>Could not load curriculum for department: "{student.department}".</p>
            </div>
        )}
        <FileUpload student={student} />
      </main>
    </div>
  );
}

export default Dashboard;
