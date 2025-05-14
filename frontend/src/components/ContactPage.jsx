import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ContactPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState(''); // ✅ Added subject state
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Please log in to send a message.');
            setLoading(false);
            return;
        }

        const contactData = { name, email, subject, message }; // ✅ Included subject

        try {
            const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/contact`, contactData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setLoading(false);
            toast.success('Message sent successfully!');
            setName('');
            setEmail('');
            setSubject(''); // ✅ Clear subject field
            setMessage('');
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Failed to send message';
            toast.error(errorMessage);
            console.error('Error sending message:', errorMessage);
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Contact Us</h2>
            <form onSubmit={handleSubmit}>
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
                    <label className="block mb-1">Subject</label>
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)} // ✅ Fixed handler
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block mb-1">Message</label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full p-2 border rounded"
                        rows="4"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                    disabled={loading}
                >
                    {loading ? 'Sending...' : 'Send Message'}
                </button>
                {loading && (
                    <div className="flex justify-center mt-2">
                        <div className="animate-spin h-5 w-5 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                    </div>
                )}
            </form>
            <ToastContainer />
        </div>
    );
};

export default ContactPage;
