import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from './components/Header';
import AuthForm from './components/AuthForm';
import HomePage from './components/HomePage';
import OrdersPage from './components/OrdersPage';
import ContactPage from './components/ContactPage';
import AdminPage from './components/AdminPage';
import OrderForm from './components/OrderForm';

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
            }).then(res => {
                setUser(res.data);
                setIsLoggedIn(true);
            }).catch(() => {
                localStorage.removeItem('token');
            });
        }
    }, []);

    useEffect(() => {
        if (isLoggedIn && user?.user_metadata.role !== 'admin') {
            axios.get(`${process.env.REACT_APP_API_URL}/api/orders`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            }).then(res => setOrders(res.data));
        }
    }, [isLoggedIn, user]);

    return (
        <Router>
            <AppContent
                isLoggedIn={isLoggedIn}
                setIsLoggedIn={setIsLoggedIn}
                user={user}
                setUser={setUser}
                orders={orders}
                setOrders={setOrders}
            />
        </Router>
    );
};

const AppContent = ({ isLoggedIn, setIsLoggedIn, user, setUser, orders, setOrders }) => {
    const navigate = useNavigate();

    const setPage = (page) => {
        navigate(`/${page}`);
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            <Header setPage={setPage} isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} user={user} />
            <main className="flex-1 py-10">
                <div className="max-w-7xl mx-auto px-4">
                    <Routes>
                        <Route path="/auth" element={<AuthForm setPage={setPage} setIsLoggedIn={setIsLoggedIn} setUser={setUser} />} />
                        <Route path="/home" element={<HomePage setPage={setPage} />} />
                        <Route path="/orders" element={<OrdersPage orders={orders} setOrders={setOrders} />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/print-request" element={<OrderForm setOrders={setOrders} />} />
                        <Route path="/admin" element={user?.user_metadata.role === 'admin' ? <AdminPage /> : <HomePage setPage={setPage} />} />
                        <Route path="/" element={<AuthForm setPage={setPage} setIsLoggedIn={setIsLoggedIn} setUser={setUser} />} />
                    </Routes>
                </div>
            </main>
            <footer className="bg-white shadow py-4">
                <div className="max-w-7xl mx-auto px-4 flex justify-between">
                    <p>© 2025 USTPrint. All rights reserved.</p>
                    <div className="flex gap-4">
                        <a
                            href="https://www.facebook.com/james.banas.33"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <i className="fab fa-facebook-f"></i>
                        </a>
                        <a
                            href="https://x.com/zuccubii098"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <i className="fab fa-twitter"></i>
                        </a>
                        <a
                            href="https://instagram.com/youraccount"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <i className="fab fa-instagram"></i>
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default App;