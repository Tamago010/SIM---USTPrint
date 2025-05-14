import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

const HomePage = ({ setPage }) => {
    const navigate = useNavigate();

    const handleStartOrder = (e) => {
        console.log('Button clicked, event target:', e.target);
        console.log('Attempting to navigate to /print-request');
        try {
            navigate('/print-request');
        } catch (error) {
            console.error('Navigation failed:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Welcome to USTPrint
                    </h1>
                    <p className="text-lg md:text-xl mb-6">
                        High-quality printing services tailored to your needs. Start creating today!
                    </p>
                    {/* Primary Button with onClick */}
                    <button
                        onClick={handleStartOrder}
                        className="bg-white text-blue-600 font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition cursor-pointer z-10"
                    >
                        Start Your Print Order
                    </button>
                    {/* Fallback Link (uncomment if button still doesn't work) */}
                    {/* <Link
                        to="/print-request"
                        className="bg-white text-blue-600 font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition cursor-pointer z-10 inline-block"
                    >
                        Start Your Print Order
                    </Link> */}
                    {/* Optional background image */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <img
                            src="/images/print-background.jpg"
                            alt="Printing background"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            </div>

            {/* Featured Services Section */}
            <div className="max-w-7xl mx-auto px-4 py-16">
                <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition">
                        <h3 className="text-xl font-semibold mb-2">Affordable Prints</h3>
                        <p className="text-gray-600">
                            Get high-quality prints at competitive prices. We believe in value for money.
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition">
                        <h3 className="text-xl font-semibold mb-2">Night Orders</h3>
                        <p className="text-gray-600">
                            Need something printed urgently? We offer night orders for your convenience.
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition">
                        <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
                        <p className="text-gray-600">
                            Get your prints delivered quickly and reliably.
                        </p>
                    </div>
                </div>
            </div>

            {/* Call-to-Action Section */}
            <div className="bg-indigo-100 py-12 text-center">
                <h2 className="text-2xl font-bold mb-4">Ready to Print?</h2>
                <p className="text-gray-600 mb-6">
                    Place your order now and experience the best printing services in USTP .
                </p>
                <button
                    onClick={() => navigate('/print-request')}
                    className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition"
                >
                    Get Started
                </button>
            </div>
        </div>
    );
};

export default HomePage;