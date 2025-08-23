// src/components/EditCategoryPage.jsx
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { departmentRules } from '../data/mockData';
import AddSubjectModal from './AddSubjectModal.jsx';

function EditCategoryPage({ student, onSave, onDelete }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [subjectToEdit, setSubjectToEdit] = useState(null);

    const { categoryName } = useParams();
    const departmentInfo = departmentRules[student.department];
    const category = departmentInfo.categories.find(
        cat => cat.name.replace(/\s+/g, '-').toLowerCase() === categoryName.toLowerCase()
    );

    // Create a Set of default subject names for easy and fast lookup.
    const defaultSubjectNames = new Set(category.subjects.map(s => s.name));

    // Create a map to hold the final list of subjects to display.
    const subjectMap = new Map();

    // First, add all default subjects from the curriculum.
    category.subjects.forEach(subject => {
        subjectMap.set(subject.name, { ...subject });
    });

    // Next, add the user's enrolled subjects. This will overwrite defaults
    // with the user's saved data (like status, notes, etc.).
    student.enrolledSubjects
        .filter(subject => subject.category === category.name)
        .forEach(subject => {
            subjectMap.set(subject.name, { ...subject });
        });
        
    const displaySubjects = Array.from(subjectMap.values());

    const handleOpenModal = (subject) => { setSubjectToEdit(subject); setIsModalOpen(true); };
    const handleCloseModal = () => { setSubjectToEdit(null); setIsModalOpen(false); };
    const handleSaveSubject = (subjectData) => { onSave(subjectData); handleCloseModal(); };
    const handleDeleteClick = (e, subjectName) => { e.stopPropagation(); onDelete(subjectName); };

    return (
        <div className="page-container">
            <div className="page-header">
                <Link to={`/category/${categoryName}`} className="back-link">← Back to View</Link>
                <h2>Editing: {category.name}</h2>
            </div>
            <p>Select a subject to add/edit its details, or add a new custom subject.</p>
            <div className="subject-grid-edit">
                {displaySubjects.map(subject => {
                    const status = subject.status || '';
                    // A subject is custom (and therefore deletable) if its name is NOT in the default list.
                    const isCustom = !defaultSubjectNames.has(subject.name);
                    const isDeletable = status && isCustom;

                    return (
                        <button key={subject.name} className={`subject-card-edit ${status}`} onClick={() => handleOpenModal(subject)}>
                            {/* The delete button will now only appear for custom subjects */}
                            {isDeletable && (
                                <span className="delete-btn" title={`Delete ${subject.name}`} onClick={(e) => handleDeleteClick(e, subject.name)}>
                                    ×
                                </span>
                            )}
                            {subject.name}
                            {status && <span className="checkmark">✔</span>}
                        </button>
                    );
                })}
                <button className="subject-card-add" onClick={() => handleOpenModal(null)}>
                    <span className="plus-symbol">+</span>
                    <span>Add Custom Subject</span>
                </button>
            </div>
            {isModalOpen && <AddSubjectModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSaveSubject} subject={subjectToEdit} category={category} />}
        </div>
    );
}
export default EditCategoryPage;
