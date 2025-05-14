// backend/models/Order.js
const mongoose = require('mongoose');

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

// ✅ Prevent OverwriteModelError
module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);
