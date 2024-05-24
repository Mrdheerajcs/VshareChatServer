const mongoose = require('mongoose');
const { Schema } = mongoose;

const contactSchema = new Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    contactId: {
        type: String,
        required: true,
    },

    name:{
        type: String,
        required: true,
    },

    nickname:{
        type:String,
        required: true,
    } ,

    phoneNumber:{
        type:String,
        required: true,   
    },
    
    date: {
        type: Date,
        default: Date.now,
        required: true
    }
});

module.exports = mongoose.model('ContactList', contactSchema);