// src/components/CategoryPage.jsx
import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { departmentRules } from '../data/mockData';
import AddSubjectModal from './AddSubjectModal.jsx';

function CategoryPage({ student, onSave }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [subjectToEdit, setSubjectToEdit] = useState(null);
    const { categoryName } = useParams();

    const departmentInfo = departmentRules[student.department];
    const category = departmentInfo.categories.find(
        cat => cat.name.replace(/\s+/g, '-').toLowerCase() === categoryName.toLowerCase()
    );

    const subjectsToShow = useMemo(() => {
        // Start by filtering out any subjects that have an empty or null status
        let subjects = student.enrolledSubjects.filter(
            sub => sub.category === category.name && sub.status
        );
        if (filter !== 'all') {
            subjects = subjects.filter(sub => sub.status === filter);
        }
        if (searchTerm) {
            subjects = subjects.filter(sub => sub.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        return subjects;
    }, [student.enrolledSubjects, category.name, filter, searchTerm]);

    const handleOpenModal = (subject) => { setSubjectToEdit(subject); setIsModalOpen(true); };
    const handleCloseModal = () => { setSubjectToEdit(null); setIsModalOpen(false); };
    const handleSaveSubject = (subjectData) => { onSave(subjectData); handleCloseModal(); };

    return (
        <div className="page-container">
            <div className="page-header">
                <Link to="/" className="back-link">← Back to Dashboard</Link>
                <h2>{category.name}</h2>
                <Link to={`/category/${categoryName}/edit`} className="btn-edit">Manage Subjects</Link>
            </div>
            <div className="card filter-controls">
                <input type="text" placeholder="Search subjects..." className="search-bar" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                    <option value="all">Filter by Status</option>
                    <option value="completed">Completed</option>
                    <option value="partially-completed">Partially Completed</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="bookmarked">Bookmarked</option>
                </select>
            </div>
            {subjectsToShow.length === 0 ? <p className="info-text">No subjects match your criteria.</p> :
                <div className="subject-grid-display">
                    {subjectsToShow.map(subject => (
                        <div key={subject.name} className={`subject-card-display ${subject.status || 'no-status'}`}>
                            <div className="subject-card-header">
                                <span className="subject-name">{subject.name}</span>
                                <button onClick={() => handleOpenModal(subject)} className="notes-btn" title="Edit Subject Details & Notes">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207z"/></svg>
                                </button>
                            </div>
                            <div className="subject-details">
                                <span>Credits: {subject.credits}</span>
                                <span>Sem: {subject.semester}</span>
                                {subject.grade && <span>Grade: {subject.grade}</span>}
                            </div>
                        </div>
                    ))}
                </div>
            }
            {isModalOpen && <AddSubjectModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSaveSubject} subject={subjectToEdit} category={category} />}
        </div>
    );
}
export default CategoryPage;
