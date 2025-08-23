// src/components/CategorizeSubjectsModal.jsx
import React, { useState, useEffect } from 'react';

function CategorizeSubjectsModal({ isOpen, onClose, onSave, subjects, categories }) {
    const [assignments, setAssignments] = useState({});

    useEffect(() => {
        if (isOpen) {
            const initialAssignments = {};
            subjects.forEach(sub => {
                initialAssignments[sub.code || sub.name] = ''; 
            });
            setAssignments(initialAssignments);
        }
    }, [isOpen, subjects]);

    if (!isOpen) return null;

    const handleCategoryChange = (subjectIdentifier, newCategory) => {
        setAssignments(prev => ({
            ...prev,
            [subjectIdentifier]: newCategory
        }));
    };

    const handleSave = () => {
        const allAssigned = Object.values(assignments).every(cat => cat !== '');
        if (!allAssigned) {
            alert("Please assign a category to all new subjects.");
            return;
        }

        const categorizedSubjects = subjects.map(sub => ({
            ...sub,
            category: assignments[sub.code || sub.name]
        }));
        
        onSave(categorizedSubjects);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Categorize New Subjects</h2>
                </div>
                <p>We found some subjects not in your curriculum. Please assign them to a category.</p>
                
                <div className="categorize-list">
                    {subjects.map(subject => (
                        <div key={subject.code || subject.name} className="categorize-item">
                            <span className="subject-name">{subject.name} ({subject.code})</span>
                            <select 
                                value={assignments[subject.code || subject.name] || ''}
                                onChange={(e) => handleCategoryChange(subject.code || subject.name, e.target.value)}
                            >
                                <option value="" disabled>-- Select a Category --</option>
                                {categories.map(cat => (
                                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>

                <div className="modal-actions">
                    <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                    <button type="button" onClick={handleSave} className="btn-primary">Save Categories</button>
                </div>
            </div>
        </div>
    );
}

export default CategorizeSubjectsModal;