const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');

// Supabase client initialization
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
console.log('Supabase client initialized with URL:', process.env.SUPABASE_URL);

// Multer setup for file uploads (using memoryStorage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Order Schema
const orderSchema = new mongoose.Schema({
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
});

// Prevent OverwriteModelError
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

// Middleware to verify user authentication
const authenticate = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    try {
        const { data, error } = await supabase.auth.getUser(token);
        if (error) throw error;
        console.log('Authenticated user:', data.user.id);
        req.user = data.user;
        next();
    } catch (error) {
        console.error('Authentication error:', error.message);
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Utility function to sanitize the filename
const sanitizeFileName = (filename) => {
    const sanitized = filename.replace(/[^\w\s.-]/g, '_');
    console.log('Original filename:', filename, 'Sanitized:', sanitized);
    return sanitized;
};

// POST /api/orders - Submit a new print request
router.post('/', authenticate, upload.single('file'), async (req, res) => {
    console.log('Received POST request to /api/orders');
    console.log('File:', req.file);

    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const sanitizedFileName = sanitizeFileName(req.file.originalname);

        const fileName = `${Date.now()}-${sanitizedFileName}`;
        console.log('Uploading file to Supabase as:', `orders/${fileName}`);
        const { data, error: uploadError } = await supabase.storage
            .from('print-files')
            .upload(`orders/${fileName}`, req.file.buffer, {
                cacheControl: '3600',
                upsert: false,
            });

        if (uploadError) {
            console.error('Supabase upload error:', uploadError);
            throw uploadError;
        }

        const { data: signedData, error: signedError } = await supabase.storage
            .from('print-files')
            .createSignedUrl(`orders/${fileName}`, 60 * 60);
        if (signedError) {
            console.error('Supabase signed URL error:', signedError);
            throw signedError;
        }
        const fileUrl = signedData.signedUrl;
        console.log('File uploaded successfully, signed URL:', fileUrl);

        const { copies, paperSize, paymentMethod, instructions, printType } = req.body;

        if (!copies || !paperSize || !paymentMethod || !printType) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const newOrder = new Order({
            userId: req.user.id,
            fileUrl: fileUrl,
            fileName: sanitizedFileName,
            fileSize: req.file.size,
            paperSize,
            printType,
            copies: parseInt(copies),
            paymentMethod,
            instructions,
        });

        await newOrder.save();
        console.log('Order saved:', newOrder);
        res.status(201).json({ message: 'Print request submitted successfully', order: newOrder });
    } catch (error) {
        console.error('Error submitting print request:', error);
        res.status(500).json({ error: 'Failed to submit print request' });
    }
});

// GET /api/orders - Fetch orders of authenticated user
router.get('/', authenticate, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error.message);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// DELETE /api/orders/:id - Delete an order if status is Completed or Cancelled
router.delete('/:id', authenticate, async (req, res) => {
    const { id } = req.params;

    try {
        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (order.userId !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized: You can only delete your own orders' });
        }

        if (order.status !== 'Completed' && order.status !== 'Cancelled') {
            return res.status(403).json({ error: 'You can only delete orders that are Completed or Cancelled' });
        }

        const filePath = order.fileUrl.split('/').pop();
        const fullFilePath = `orders/${filePath.split('?')[0]}`;
        console.log('Attempting to delete file from Supabase:', fullFilePath);

        const { error: deleteFileError } = await supabase.storage
            .from('print-files')
            .remove([fullFilePath]);
        if (deleteFileError) {
            console.error('Error deleting file from Supabase:', deleteFileError.message);
            throw deleteFileError;
        }

        await Order.findByIdAndDelete(id);
        console.log('Order deleted from MongoDB:', order._id);
        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
        console.error('Error deleting order:', error.message);
        res.status(500).json({ error: 'Failed to delete order' });
    }
});

// PUT /api/orders/:id/cancel - Cancel an order if status is Pending or Processing
router.put('/:id/cancel', authenticate, async (req, res) => {
    const { id } = req.params;

    try {
        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (order.userId !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized: You can only cancel your own orders' });
        }

        if (order.status !== 'Pending' && order.status !== 'Processing') {
            return res.status(403).json({ error: 'You can only cancel orders that are Pending or Processing' });
        }

        order.status = 'Cancelled';
        await order.save();
        console.log('Order cancelled:', order._id);
        res.status(200).json({ message: 'Order cancelled successfully', order });
    } catch (error) {
        console.error('Error cancelling order:', error.message);
        res.status(500).json({ error: 'Failed to cancel order' });
    }
});

module.exports = router;