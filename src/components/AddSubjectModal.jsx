// src/components/AddSubjectModal.jsx
import React, { useState, useEffect, useRef } from 'react';

function AddSubjectModal({ isOpen, onClose, onSave, subject, category }) {
    const [subjectName, setSubjectName] = useState('');
    const [credits, setCredits] = useState('');
    const [status, setStatus] = useState('');
    const [semester, setSemester] = useState('');
    const [notes, setNotes] = useState('');
    const [showNotes, setShowNotes] = useState(false); // New state to toggle notes
    const notesRef = useRef(null);

    const isReadOnly = subject?.isFromPDF;

    useEffect(() => {
        if (isOpen) {
            if (subject) {
                setSubjectName(subject.name || '');
                setCredits(subject.credits || '');
                setStatus(isReadOnly ? 'completed' : (subject.status || ''));
                setSemester(subject.semester || '');
                setNotes(subject.notes || '');
            } else {
                setSubjectName(''); setCredits(''); setStatus('ongoing');
                setSemester(''); setNotes('');
            }
            // Reset notes visibility when modal opens
            setShowNotes(false); 
        }
    }, [subject, isOpen, isReadOnly]);

    useEffect(() => {
        // Auto-focus the textarea when it appears
        if (showNotes) {
            notesRef.current?.focus();
        }
    }, [showNotes]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!subjectName || credits === '' || !semester) {
            alert("Please fill out Subject Name, Credits, and Semester.");
            return;
        }
        if (!status && !isReadOnly) {
            alert("Please select a status for the subject.");
            return;
        }
        onSave({
            ...subject,
            name: subjectName.trim(),
            credits: parseInt(credits),
            status: status,
            semester: parseInt(semester),
            category: category.name,
            notes: notes, // Save the notes along with other data
        });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{subject ? `Editing: ${subject.name}` : `Add Subject`}</h2>
                    {/* Notes icon is now in the top right */}
                    {subject && (
                        <button onClick={() => setShowNotes(!showNotes)} className="notes-icon-btn" title="Toggle Notes">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207z"/>
                            </svg>
                        </button>
                    )}
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Subject Name</label>
                        <input type="text" value={subjectName} onChange={(e) => setSubjectName(e.target.value)} disabled={isReadOnly || (!!subject && subject.isDefault)} required />
                    </div>
                    <div className="form-group">
                        <label>Credits</label>
                        <input type="number" min="0" max="10" value={credits} onChange={(e) => setCredits(e.target.value)} disabled={isReadOnly} required />
                    </div>
                    <div className="form-group">
                        <label>Status</label>
                        {isReadOnly ? (
                            <input type="text" value="Completed (Verified by PDF)" disabled />
                        ) : (
                            <select value={status} onChange={(e) => setStatus(e.target.value)}>
                                <option value="">-- No Status (Hidden) --</option>
                                <option value="partially-completed">Partially Completed</option>
                                <option value="ongoing">Ongoing</option>
                                <option value="bookmarked">Bookmarked</option>
                            </select>
                        )}
                    </div>
                    <div className="form-group">
                        <label>Semester</label>
                        <input type="number" min="1" max="8" value={semester} onChange={(e) => setSemester(e.target.value)} disabled={isReadOnly} required />
                    </div>
                    
                    {/* Conditionally render the notes textarea */}
                    {showNotes && (
                        <div className="form-group">
                            <label>Notes</label>
                            <textarea ref={notesRef} className="notes-textarea-inline" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add personal notes here..."></textarea>
                        </div>
                    )}

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                        <button type="submit" className="btn-primary">Save Subject</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
export default AddSubjectModal;
