const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const Message = require('../models/Message');
const router = express.Router();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

// Middleware to authenticate user (optional for contact form)
const authenticateOptional = async (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    let userId = 'anonymous';

    if (token) {
        try {
            const { data, error } = await supabase.auth.getUser(token);
            if (error) {
                console.error('Supabase auth error:', error.message);
                // Continue as anonymous if token is invalid
            } else if (data.user) {
                userId = data.user.id;
            }
        } catch (err) {
            console.error('Authentication error:', err.message);
        }
    }

    req.userId = userId;
    next();
};

// Handle contact form submission
router.post('/', authenticateOptional, async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validate input
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Save contact message to MongoDB
        const contactMessage = new Message({
            sender: req.userId,
            content: `Contact Form - Name: ${name}, Email: ${email}, Subject: ${subject}, Message: ${message}`,
            timestamp: new Date(),
        });
        await contactMessage.save();
        console.log('Contact message saved:', contactMessage._id);

        // Notify admin via Socket.IO
        const io = req.app.get('io');
        if (io) {
            io.emit('newMessage', contactMessage);
            console.log('Emitted newMessage event via Socket.IO');
        } else {
            console.warn('Socket.IO instance not found');
        }

        res.status(200).json({ message: 'Contact message sent successfully' });
    } catch (err) {
        console.error('Error processing contact form:', err.message);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// Get all contact messages (for admin)
router.get('/', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const { data, error } = await supabase.auth.getUser(token);
        if (error) {
            console.error('Supabase auth error:', error.message);
            return res.status(401).json({ error: 'Invalid token' });
        }

        if (!data.user.user_metadata || data.user.user_metadata.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized: Admin access required' });
        }

        const messages = await Message.find({ orderId: null }).sort({ timestamp: -1 });
        res.status(200).json(messages);
    } catch (err) {
        console.error('Error fetching contact messages:', err.message);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

module.exports = router;