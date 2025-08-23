// src/components/SignupPage.jsx
import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { setDoc, doc } from 'firebase/firestore';
import { initialStudentData } from '../data/mockData';

const departments = [
    "Computer Science & Engineering", // Make sure this matches the key in mockData.js
    "Artificial Intelligence & Data Science",
    "Artificial Intelligence & Machine Learning",
    "Computer Science & Engineering (Cyber Security)",
    "Computer Science & Engineering (IoT)",
    "Information Technology",
    "Agricultural Engineering",
    "Bio Medical Engineering",
    "Civil Engineering",
    "Chemical Engineering",
    "Electrical & Electronics Engineering",
    "Electronics & Instrumentation Engineering",
    "Electronics & Communication Engineering",
    "Mechanical Engineering",
    "Medical Electronics"
];

function SignupPage({ onSwitchToLogin }) {
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [regNo, setRegNo] = useState('');
    const [department, setDepartment] = useState(''); // Default to empty
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignup = (e) => {
        e.preventDefault();
        setError('');
        if (!department) {
            setError("Please select your department.");
            return;
        }
        setLoading(true);

        const email = `${regNo.trim()}@student-dashboard.com`;

        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                const studentDocRef = doc(db, "students", user.uid);
                
                const newStudentData = {
                    ...initialStudentData,
                    department: department,
                    profile: {
                        ...initialStudentData.profile,
                        name: name,
                        regNo: regNo,
                        program: `B.E. ${department}`
                    }
                };
                
                return setDoc(studentDocRef, newStudentData);
            })
            .catch((error) => {
                console.error("Error signing up:", error);
                setError("Failed to create an account. Please check your details.");
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <div className="auth-container">
            <div className="auth-panel">
                 <div className="auth-form-container">
                    <div className="auth-card">
                        <h2>Create Your Account</h2>
                        <form onSubmit={handleSignup}>
                            <div className="form-group">
                                <label>Full Name</label>
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>Register Number</label>
                                <input type="text" value={regNo} onChange={(e) => setRegNo(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>Department</label>
                                <select value={department} onChange={(e) => setDepartment(e.target.value)} required>
                                    <option value="" disabled>Select a department</option>
                                    {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                            </div>
                            {error && <p className="auth-error">{error}</p>}
                            <button type="submit" className="auth-btn" disabled={loading}>
                                {loading ? 'Creating Account...' : 'Sign Up'}
                            </button>
                        </form>
                        <p className="auth-switch">
                            Already have an account?{' '}
                            <button onClick={onSwitchToLogin} className="link-btn">Login</button>
                        </p>
                    </div>
                </div>
                <div className="auth-image-container">
                    <img src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop" alt="University campus" />
                </div>
            </div>
        </div>
    );
}

export default SignupPage;
