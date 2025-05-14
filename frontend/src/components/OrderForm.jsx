import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const OrderForm = ({ setOrders }) => { // Add setOrders prop to update orders state
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [copies, setCopies] = useState(1);
    const [paperSize, setPaperSize] = useState('A4');
    const [printType, setPrintType] = useState('Black & White');
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [instructions, setInstructions] = useState('');
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Please log in to submit a print request.');
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('copies', copies);
        formData.append('paperSize', paperSize);
        formData.append('printType', printType);
        formData.append('paymentMethod', paymentMethod);
        formData.append('instructions', instructions);

        try {
            console.log('Sending print request to:', `${process.env.REACT_APP_API_URL}/api/orders`);
            const res = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/orders`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Fetch the updated orders list
            const updatedOrdersRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/orders`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setOrders(updatedOrdersRes.data); // Update the orders state with the latest data

            setLoading(false);
            toast.success('Print request submitted successfully!', {
                onClose: () => navigate('/orders'), // Redirect after toast closes and state is updated
            });
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Failed to submit print request';
            toast.error(errorMessage);
            console.error('Print request error:', errorMessage);
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Submit Print Request</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block mb-1">File to Print</label>
                    <input
                        type="file"
                        onChange={handleFileChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block mb-1">Number of Copies</label>
                    <input
                        type="number"
                        value={copies}
                        onChange={(e) => setCopies(e.target.value)}
                        min="1"
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block mb-1">Paper Size</label>
                    <select
                        value={paperSize}
                        onChange={(e) => setPaperSize(e.target.value)}
                        className="w-full p-2 border rounded"
                    >
                        <option value="A4">A4</option>
                        <option value="Long">Long</option>
                        <option value="Legal">Legal</option>
                        <option value="Short">Short</option>
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block mb-1">Print Type</label>
                    <select
                        value={printType}
                        onChange={(e) => setPrintType(e.target.value)}
                        className="w-full p-2 border rounded"
                    >
                        <option value="Black & White">Black & White</option>
                        <option value="Color">Color</option>
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block mb-1">Payment Method</label>
                    <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full p-2 border rounded"
                    >
                        <option value="Cash">Cash</option>
                        <option value="G-Cash">G-Cash</option>
                        <option value="PayPal">PayPal</option>
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block mb-1">Special Instructions</label>
                    <textarea
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        className="w-full p-2 border rounded"
                        rows="3"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                    disabled={loading}
                >
                    {loading ? 'Submitting...' : 'Submit Print Request'}
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

export default OrderForm;