// src/components/LoginPage.jsx
import React, { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebaseConfig';

function LoginPage({ onSwitchToSignup }) {
    const [regNo, setRegNo] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        const email = `${regNo.trim()}@student-dashboard.com`;

        signInWithEmailAndPassword(auth, email, password)
            .catch((error) => {
                console.error("Error signing in:", error);
                setError("Failed to sign in. Please check your register number and password.");
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleForgotPassword = () => {
        setError('');
        setMessage('');
        const regNoToReset = prompt("Please enter your register number to receive a password reset link.");
        if (regNoToReset) {
            const emailToReset = `${regNoToReset.trim()}@student-dashboard.com`;
            sendPasswordResetEmail(auth, emailToReset)
                .then(() => {
                    setMessage("Password reset link sent! Please check the email associated with your account.");
                })
                .catch((error) => {
                    console.error("Error sending password reset email:", error);
                    setError("Could not send reset link. Please ensure the register number is correct.");
                });
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-panel">
                <div className="auth-form-container">
                    <div className="auth-card">
                        <h2>Welcome Back!</h2>
                        <p className="auth-subtitle">Login to access your dashboard.</p>
                        <form onSubmit={handleLogin}>
                            <div className="form-group">
                                <label>Register Number</label>
                                <input
                                    type="text"
                                    value={regNo}
                                    onChange={(e) => setRegNo(e.target.value)}
                                    required
                                    placeholder="Enter your register number"
                                />
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="Enter your password"
                                />
                            </div>
                            {error && <p className="auth-error">{error}</p>}
                            {message && <p className="auth-message">{message}</p>}
                            <div className="forgot-password">
                                <button type="button" onClick={handleForgotPassword} className="link-btn">Forgot Password?</button>
                            </div>
                            <button type="submit" className="auth-btn" disabled={loading}>
                                {loading ? 'Logging in...' : 'Login'}
                            </button>
                        </form>
                        <p className="auth-switch">
                            Don't have an account?{' '}
                            <button onClick={onSwitchToSignup} className="link-btn">Sign Up</button>
                        </p>
                    </div>
                </div>
                {/* <div className="auth-image-container">
                    <img src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop" alt="University campus" />
                </div> */}
            </div>
        </div>
    );
}

export default LoginPage;
