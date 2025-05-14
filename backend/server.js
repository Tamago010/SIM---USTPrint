const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');
const cors = require('cors');
const socketIo = require('socket.io');
const http = require('http');
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');
const messageRoutes = require('./routes/messages');
const contactRoutes = require('./routes/contact');
const adminRoutes = require('./routes/admin');
const Message = require('./models/Message');

console.log('SUPABASE_URL:', process.env.SUPABASE_URL);

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        methods: ['GET', 'POST'],
    },
});

app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use(express.urlencoded({ extended: true }));

// Attach io to the app so routes can access it
app.set('io', io);

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    socket.on('sendMessage', async (message) => {
        try {
            const { data, error } = await supabase.auth.getUser();
            if (error) throw error;
            const newMessage = new Message({
                sender: data.user.id,
                content: message.content,
                orderId: message.orderId,
                timestamp: new Date(),
            });
            await newMessage.save();
            io.emit('newMessage', newMessage);
        } catch (err) {
            console.error('Error sending message:', err);
        }
    });
    socket.on('disconnect', () => console.log('User disconnected:', socket.id));
});

app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));