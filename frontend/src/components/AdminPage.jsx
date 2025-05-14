import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminPage = () => {
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('orders'); // Toggle between orders and users

    // Fetch all orders or users based on active tab
    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/orders`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setOrders(res.data);
            } catch (err) {
                console.error('Error fetching orders:', err.response?.data || err.message);
                toast.error('Failed to fetch orders');
            } finally {
                setLoading(false);
            }
        };

        const fetchUsers = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/users`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log('Fetched users:', res.data); // Debug log to inspect user data
                setUsers(res.data);
            } catch (err) {
                console.error('Error fetching users:', err.response?.data || err.message);
                toast.error('Failed to fetch users');
            } finally {
                setLoading(false);
            }
        };

        if (activeTab === 'orders') {
            fetchOrders();
        } else {
            fetchUsers();
        }
    }, [activeTab]);

    // Handle status update
    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(
                `${process.env.REACT_APP_API_URL}/api/admin/orders/${orderId}`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log('Status update response:', res.data); // Debug log
            // Update the orders state with the new status from the backend
            setOrders(orders.map(order =>
                order._id === orderId ? { ...order, status: res.data.order.status } : order
            ));
            toast.success('Order status updated');
        } catch (err) {
            console.error('Error updating status:', err.response?.data || err.message);
            toast.error('Failed to update order status: ' + (err.response?.data?.error || err.message));
        }
    };

    // Handle order deletion
    const handleDeleteOrder = async (orderId) => {
        if (window.confirm('Are you sure you want to delete this order?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${process.env.REACT_APP_API_URL}/api/admin/orders/${orderId}`, {
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

    // Handle user deletion
    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${process.env.REACT_APP_API_URL}/api/admin/users/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUsers(users.filter(user => user.id !== userId));
                toast.success('User deleted successfully');
            } catch (err) {
                console.error('Error deleting user:', err.response?.data || err.message);
                toast.error('Failed to delete user');
            }
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
            <div className="flex gap-4 mb-4">
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`px-4 py-2 rounded ${activeTab === 'orders' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                    Manage Orders
                </button>
                <button
                    onClick={() => setActiveTab('users')}
                    className={`px-4 py-2 rounded ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                    Manage Users
                </button>
            </div>

            {activeTab === 'orders' ? (
                <>
                    <h2 className="text-xl font-semibold mb-2">Manage Orders</h2>
                    {loading ? (
                        <div className="flex justify-center">
                            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                        </div>
                    ) : orders.length === 0 ? (
                        <p className="text-gray-600">No orders found.</p>
                    ) : (
                        <div className="grid gap-4">
                            {orders.map(order => (
                                <div key={order._id} className="bg-white p-4 rounded-lg shadow">
                                    <h3 className="text-lg font-semibold">{order.fileName}</h3>
                                    <p><strong>User ID:</strong> {order.userId}</p>
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
                                        <div>
                                            <label className="block mb-1">Update Status:</label>
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                                className="p-2 border rounded"
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Processing">Processing</option>
                                                <option value="Completed">Completed</option>
                                                <option value="Cancelled">Cancelled</option>
                                            </select>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteOrder(order._id)}
                                            className="mt-2 bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
                                        >
                                            Delete Order
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <>
                    <h2 className="text-xl font-semibold mb-2">Manage Users</h2>
                    {loading ? (
                        <div className="flex justify-center">
                            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                        </div>
                    ) : users.length === 0 ? (
                        <p className="text-gray-600">No users found.</p>
                    ) : (
                        <div className="grid gap-4">
                            {users
                                .filter(user => user.role !== 'admin' && user.id !== localStorage.getItem('tokenUserId'))
                                .map(user => (
                                    <div key={user.id} className="bg-white p-4 rounded-lg shadow">
                                        <h3 className="text-lg font-semibold">{user.name}</h3>
                                        <p><strong>Email:</strong> {user.email}</p>
                                        <p><strong>Role:</strong> {user.role || 'user'}</p>
                                        <p><strong>Joined:</strong> {new Date(user.created_at).toLocaleString()}</p>
                                        <button
                                            onClick={() => handleDeleteUser(user.id)}
                                            className="mt-2 bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
                                        >
                                            Delete User
                                        </button>
                                    </div>
                                ))}
                        </div>
                    )}
                </>
            )}
            <ToastContainer />
        </div>
    );
};

export default AdminPage;