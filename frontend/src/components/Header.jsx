import React from 'react';

const Header = ({ setPage, isLoggedIn, setIsLoggedIn, user }) => {
    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        setPage('auth');
    };

    return (
        <header className="bg-white shadow py-4">
            <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold">USTPrint</h1>
                <nav className="flex gap-4">
                    {isLoggedIn ? (
                        user?.user_metadata.role === 'admin' ? (
                            <>
                                <button onClick={() => setPage('admin')} className="hover:text-blue-600">Admin Dashboard</button>
                                <button onClick={handleLogout} className="hover:text-blue-600">Logout</button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => setPage('home')} className="hover:text-blue-600">Home</button>
                                <button onClick={() => setPage('orders')} className="hover:text-blue-600">My Orders</button>
                                <button onClick={() => setPage('contact')} className="hover:text-blue-600">Contact</button>
                                <button onClick={handleLogout} className="hover:text-blue-600">Logout</button>
                            </>
                        )
                    ) : (
                        <button onClick={() => setPage('auth')} className="hover:text-blue-600">Login / Sign Up</button>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;