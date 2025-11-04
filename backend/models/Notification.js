const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }, // receiver
    message: {
        type: String,
        required: true
    },
    link: {
        type: String
    }, // optional redirect link (e.g. `/petition/:id`)
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Notification', NotificationSchema);
