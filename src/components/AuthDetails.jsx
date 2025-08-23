// src/components/AuthDetails.jsx
import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';

function AuthDetails() {
    const handleSignOut = () => {
        signOut(auth).catch(error => console.error("Error signing out:", error));
    };

    return (
        <div className="auth-details">
            {auth.currentUser && (
                <button onClick={handleSignOut} className="signout-btn">Sign Out</button>
            )}
        </div>
    );
}

export default AuthDetails;
