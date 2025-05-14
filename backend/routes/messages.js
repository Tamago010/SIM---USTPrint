const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const Message = require('../models/Message');
const router = express.Router();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

// Send a message related to an order
router.post('/', async (req, res) => {
    try {
        const { data, error } = await supabase.auth.getUser(req.headers.authorization.replace('Bearer ', ''));
        if (error) throw error;

        const { content, orderId } = req.body;

        // Validate input
        if (!content || !orderId) {
            return res.status(400).json({ error: 'Content and orderId are required' });
        }

        // Verify user has access to the order
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        if (order.userId !== data.user.id && data.user.user_metadata.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized: Cannot access this order' });
        }

        // Save message to MongoDB
        const message = new Message({
            sender: data.user.id,
            content,
            orderId,
            timestamp: new Date(),
        });
        await message.save();

        // Notify via Socket.IO
        const io = req.app.get('io');
        io.emit('newMessage', message);

        res.status(201).json(message);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get messages for a specific order
router.get('/:orderId', async (req, res) => {
    try {
        const { data, error } = await supabase.auth.getUser(req.headers.authorization.replace('Bearer ', ''));
        if (error) throw error;

        const order = await Order.findById(req.params.orderId);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        if (order.userId !== data.user.id && data.user.user_metadata.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized: Cannot access this order' });
        }

        const messages = await Message.find({ orderId: req.params.orderId }).sort({ timestamp: 1 });
        res.status(200).json(messages);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;