import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AuthForm = ({ setPage, setIsLoggedIn, setUser }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false); // State for email confirmation modal
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
        const data = isLogin ? { email, password } : { email, password, name };

        try {
            const res = await axios.post(`${process.env.REACT_APP_API_URL}${endpoint}`, data, {
                headers: { 'Content-Type': 'application/json' },
            });

            if (isLogin) {
                // Login success
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('tokenUserId', res.data.user.id); // Store user ID
                setUser(res.data.user);
                setIsLoggedIn(true);
                toast.success('Login successful!');
                setTimeout(() => {
                    if (res.data.user.user_metadata?.role === 'admin') {
                        navigate('/admin');
                    } else {
                        navigate('/home');
                    }
                }, 2000); // Delay to show toast
            } else {
                // Signup success
                if (res.data.confirmationRequired) {
                    // Email confirmation required
                    setShowEmailModal(true); // Show modal with "Check your email"
                    setTimeout(() => {
                        setShowEmailModal(false);
                        setIsLogin(true); // Switch to login after signup
                    }, 5000); // Modal auto-closes after 5 seconds
                } else {
                    // Immediate session available (email confirmation disabled)
                    localStorage.setItem('token', res.data.token);
                    localStorage.setItem('tokenUserId', res.data.user.id);
                    setUser(res.data.user);
                    setIsLoggedIn(true);
                    toast.success('Signup successful! Logging you in...');
                    setTimeout(() => navigate('/home'), 2000);
                }
            }
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.message || 'Authentication failed';
            console.error('Authentication error:', errorMessage, err.response?.data);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow mt-10">
            <h2 className="text-xl font-bold mb-4">{isLogin ? 'Login' : 'Sign Up'}</h2>
            <form onSubmit={handleSubmit}>
                {!isLogin && (
                    <div className="mb-4">
                        <label className="block mb-1">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                )}
                <div className="mb-4">
                    <label className="block mb-1">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block mb-1">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                    disabled={loading}
                >
                    {loading ? 'Processing...' : isLogin ? 'Login' : 'Sign Up'}
                </button>
                <p className="mt-2 text-center">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <span
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-blue-600 cursor-pointer hover:underline"
                    >
                        {isLogin ? 'Sign Up' : 'Login'}
                    </span>
                </p>
                {loading && (
                    <div className="flex justify-center mt-2">
                        <div className="animate-spin h-5 w-5 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                    </div>
                )}
            </form>
            <ToastContainer />

            {/* Email Confirmation Modal */}
            {showEmailModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
                        <h3 className="text-lg font-bold mb-2">Check Your Email</h3>
                        <p className="mb-4">We've sent a confirmation email to {email}. Please verify your email to continue.</p>
                        <button
                            onClick={() => {
                                setShowEmailModal(false);
                                setIsLogin(true);
                            }}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Okay
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuthForm;