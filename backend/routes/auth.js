const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Signup Route
router.post('/signup', async (req, res) => {
    console.log('Received POST request to /api/auth/signup'); // Debug log
    const { name, email, password } = req.body;

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name, role: 'user' }, // Default role as 'user'
            },
        });

        if (error) throw error;

        if (data.user && !data.session) {
            console.log('Signup successful, email confirmation required:', data.user.id);
            return res.status(200).json({
                message: 'Signup successful. Check your email for confirmation.',
                user: {
                    id: data.user.id,
                    email: data.user.email,
                    user_metadata: data.user.user_metadata,
                },
                confirmationRequired: true,
            });
        }

        console.log('Signup successful, session created:', data.user.id);
        res.status(201).json({
            token: data.session.access_token,
            user: {
                id: data.user.id,
                email: data.user.email,
                user_metadata: data.user.user_metadata,
            },
            confirmationRequired: false,
        });
    } catch (error) {
        console.error('Signup error:', error.message);
        res.status(400).json({ error: error.message || 'Failed to sign up' });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    console.log('Received POST request to /api/auth/login'); // Debug log
    const { email, password } = req.body;

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;

        console.log('Login successful:', data.user.id);
        res.status(200).json({
            token: data.session.access_token,
            user: {
                id: data.user.id,
                email: data.user.email,
                user_metadata: data.user.user_metadata,
            },
        });
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(400).json({ error: error.message || 'Failed to log in' });
    }
});

// Get Current User (me endpoint)
router.get('/me', async (req, res) => {
    console.log('Received GET request to /api/auth/me'); // Debug log
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const { data, error } = await supabase.auth.getUser(token);

        if (error) throw error;

        res.status(200).json({
            id: data.user.id,
            email: data.user.email,
            user_metadata: data.user.user_metadata,
        });
    } catch (error) {
        console.error('Me endpoint error:', error.message);
        res.status(401).json({ error: 'Invalid token' });
    }
});

module.exports = router;