import React from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const OrdersPage = ({ orders, setOrders }) => {
    // Handle order deletion
    const handleDeleteOrder = async (orderId) => {
        if (window.confirm('Are you sure you want to delete this order?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${process.env.REACT_APP_API_URL}/api/orders/${orderId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setOrders(orders.filter(order => order._id !== orderId));
                toast.success('Order deleted successfully');
            } catch (err) {
                console.error('Error deleting order:', err.response?.data || err.message);
                toast.error('Failed to delete order');
            }
        }
    };

    // Handle order cancellation
    const handleCancelOrder = async (orderId) => {
        if (window.confirm('Are you sure you want to cancel this order?')) {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.put(
                    `${process.env.REACT_APP_API_URL}/api/orders/${orderId}/cancel`,
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setOrders(orders.map(order =>
                    order._id === orderId ? { ...order, status: res.data.order.status } : order
                ));
                toast.success('Order cancelled successfully');
            } catch (err) {
                console.error('Error cancelling order:', err.response?.data || err.message);
                toast.error('Failed to cancel order');
            }
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">My Orders</h1>
            {orders.length === 0 ? (
                <p className="text-gray-600">You have no orders yet. Submit a print request to get started!</p>
            ) : (
                <div className="grid gap-4">
                    {orders.map(order => (
                        <div key={order._id} className="bg-white p-4 rounded-lg shadow">
                            <h2 className="text-lg font-semibold">{order.fileName}</h2>
                            <p>
                                <strong>Status:</strong>{' '}
                                <span
                                    className={`capitalize ${
                                        order.status === 'Pending'
                                            ? 'text-yellow-600'
                                            : order.status === 'Completed'
                                            ? 'text-green-600'
                                            : order.status === 'Processing'
                                            ? 'text-blue-600'
                                            : 'text-red-600'
                                    }`}
                                >
                                    {order.status}
                                </span>
                            </p>
                            <p><strong>Copies:</strong> {order.copies}</p>
                            <p><strong>Paper Size:</strong> {order.paperSize}</p>
                            <p><strong>Print Type:</strong> {order.printType}</p>
                            <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
                            {order.instructions && <p><strong>Instructions:</strong> {order.instructions}</p>}
                            <p><strong>Submitted:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                            <a
                                href={order.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                            >
                                View File
                            </a>
                            <div className="mt-2 flex gap-2">
                                {(order.status === 'Pending' || order.status === 'Processing') && (
                                    <button
                                        onClick={() => handleCancelOrder(order._id)}
                                        className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
                                    >
                                        Cancel Order
                                    </button>
                                )}
                                {(order.status === 'Completed' || order.status === 'Cancelled') && (
                                    <button
                                        onClick={() => handleDeleteOrder(order._id)}
                                        className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
                                    >
                                        Delete Order
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <ToastContainer />
        </div>
    );
};

export default OrdersPage;