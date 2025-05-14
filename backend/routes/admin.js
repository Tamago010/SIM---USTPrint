const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { createClient } = require('@supabase/supabase-js');

// Supabase client initialization
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Order Model
const Order = mongoose.models.Order || mongoose.model('Order', new mongoose.Schema({
    userId: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    paperSize: { type: String, required: true },
    printType: { type: String, required: true },
    copies: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    instructions: { type: String },
    status: { type: String, default: 'Pending' },
    createdAt: { type: Date, default: Date.now },
}));

// Middleware to verify user authentication and admin role
const authenticateAdmin = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    console.log('Token received:', token ? 'Present' : 'Missing');
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    try {
        const { data, error } = await supabase.auth.getUser(token);
        if (error) {
            console.error('Supabase auth error:', error.message);
            throw error;
        }
        if (!data.user.user_metadata || data.user.user_metadata.role !== 'admin') {
            console.log('User metadata:', data.user.user_metadata);
            return res.status(403).json({ error: 'Unauthorized: Admin access required' });
        }
        req.user = data.user;
        next();
    } catch (error) {
        console.error('Admin authentication error:', error.message);
        res.status(401).json({ error: 'Invalid token' });
    }
};

// GET /api/admin/orders - Fetch all orders (admin only)
router.get('/orders', authenticateAdmin, async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching all orders:', error.message);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// PUT /api/admin/orders/:id - Update order status (admin only)
router.put('/orders/:id', authenticateAdmin, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['Pending', 'Processing', 'Completed', 'Cancelled'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    try {
        const order = await Order.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        console.log('Order updated:', order);
        res.status(200).json({ message: 'Order status updated', order });
    } catch (error) {
        console.error('Error updating order status:', error.message);
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

// DELETE /api/admin/orders/:id - Delete an order (admin only)
router.delete('/orders/:id', authenticateAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Extract the file path from the fileUrl
        const filePath = order.fileUrl.split('/').pop(); // Get the last part of the URL
        const fullFilePath = `orders/${filePath.split('?')[0]}`; // Remove query params and prepend 'orders/'
        console.log('Attempting to delete file from Supabase:', fullFilePath);

        // Delete the file from Supabase Storage
        const { error: deleteFileError } = await supabase.storage
            .from('print-files')
            .remove([fullFilePath]);
        if (deleteFileError) {
            console.error('Error deleting file from Supabase:', deleteFileError.message);
            throw deleteFileError;
        }

        // Delete the order from MongoDB
        await Order.findByIdAndDelete(id);
        console.log('Order deleted from MongoDB:', order._id);
        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
        console.error('Error deleting order:', error.message);
        res.status(500).json({ error: 'Failed to delete order' });
    }
});

// GET /api/admin/users - Fetch all users (admin only)
router.get('/users', authenticateAdmin, async (req, res) => {
    try {
        const { data, error } = await supabase.auth.admin.listUsers();
        if (error) throw error;

        const users = data.users.map(user => ({
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || 'N/A',
            role: user.user_metadata?.role || 'user',
            created_at: user.created_at,
        }));

        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error.message);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// DELETE /api/admin/users/:id - Delete a user (admin only, cannot delete admins)
router.delete('/users/:id', authenticateAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        const { data: user, error: fetchError } = await supabase.auth.admin.getUserById(id);
        if (fetchError) throw fetchError;

        if (user.user_metadata?.role === 'admin') {
            return res.status(403).json({ error: 'Cannot delete admin users' });
        }

        const { error: deleteError } = await supabase.auth.admin.deleteUser(id);
        if (deleteError) throw deleteError;

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error.message);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

module.exports = router;