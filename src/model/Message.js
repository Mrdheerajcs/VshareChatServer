const mongoose = require('mongoose');
const { Schema } = mongoose;


const MessageSchema = new Schema({
    conversationId: {
        type: String
    },
    senderId: {
        type: String
    },
    receiverId: {
        type: String
    },
    text: {
        type: String
    },
    type: {
        type: String
    },
    language: {
        type: String
    }
},
    {
        timestamps: true
    })


module.exports = mongoose.model('Message', MessageSchema);