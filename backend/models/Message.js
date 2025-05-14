const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: { type: String, required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
});

module.exports = mongoose.model('Message', messageSchema);