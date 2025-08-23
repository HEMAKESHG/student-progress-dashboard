// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { db, auth } from './firebaseConfig.js';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

import Dashboard from './components/Dashboard.jsx';
import CategoryPage from './components/CategoryPage.jsx';
import EditCategoryPage from './components/EditCategoryPage.jsx';
import ProfilePage from './components/ProfilePage.jsx';
import LoginPage from './components/LoginPage.jsx';
import SignupPage from './components/SignupPage.jsx';

function PrivateRoute({ authUser, student, children }) {
    if (!authUser) {
        return <Navigate to="/login" />;
    }
    if (!student) {
        return <div className="loading-screen">Loading student data...</div>;
    }
    return children;
}

function App() {
    const [authUser, setAuthUser] = useState(null);
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showLogin, setShowLogin] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setAuthUser(user);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (authUser) {
            const docRef = doc(db, "students", authUser.uid);
            const unsubscribe = onSnapshot(docRef, (docSnap) => {
                if (docSnap.exists()) {
                    setStudent(docSnap.data());
                }
            });
            return () => unsubscribe();
        } else {
            setStudent(null);
        }
    }, [authUser]);

    const updateEnrolledSubjects = async (newSubject) => {
        if (!student || !authUser) return;
        const newEnrolledSubjects = student.enrolledSubjects.filter(sub => sub.name !== newSubject.name);
        newEnrolledSubjects.push(newSubject);
        const docRef = doc(db, "students", authUser.uid);
        await setDoc(docRef, { ...student, enrolledSubjects: newEnrolledSubjects }, { merge: true });
    };

    const handleDeleteSubject = async (subjectName) => {
        if (!student || !authUser) return;
        if (window.confirm(`Are you sure you want to delete "${subjectName}"?`)) {
            const newEnrolledSubjects = student.enrolledSubjects.filter(sub => sub.name !== subjectName);
            const docRef = doc(db, "students", authUser.uid);
            await setDoc(docRef, { ...student, enrolledSubjects: newEnrolledSubjects }, { merge: true });
        }
    };

    const handleResetData = async () => {
        if (!student || !authUser) return;
        const docRef = doc(db, "students", authUser.uid);
        await setDoc(docRef, { ...student, enrolledSubjects: [], semesterResults: {} }, { merge: true });
    };

    if (loading) {
        return <div className="loading-screen">Authenticating...</div>;
    }

    return (
        <Routes>
            <Route path="/login" element={!authUser ? (showLogin ? <LoginPage onSwitchToSignup={() => setShowLogin(false)} /> : <SignupPage onSwitchToLogin={() => setShowLogin(true)} />) : <Navigate to="/" />} />
            
            <Route path="/" element={
                <PrivateRoute authUser={authUser} student={student}>
                    <Dashboard student={student} />
                </PrivateRoute>
            } />
            <Route path="/profile" element={<PrivateRoute authUser={authUser} student={student}><ProfilePage studentProfile={student?.profile} onReset={handleResetData} /></PrivateRoute>} />
            <Route path="/category/:categoryName" element={<PrivateRoute authUser={authUser} student={student}><CategoryPage student={student} onSave={updateEnrolledSubjects} /></PrivateRoute>} />
            <Route path="/category/:categoryName/edit" element={<PrivateRoute authUser={authUser} student={student}><EditCategoryPage student={student} onSave={updateEnrolledSubjects} onDelete={handleDeleteSubject} /></PrivateRoute>} />

            <Route path="*" element={<Navigate to={authUser ? "/" : "/login"} />} />
        </Routes>
    );
}

export default App;
