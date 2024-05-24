const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({

    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
    },

    password: {
        type: String,
        required: true
    },

    // Refrence to other user documents
    contacts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    // Profile 
    profile:{
        profilePic:String,
        fullName: String,
        nickName: String,
        phoneNumber: String,
        location:String,
        bio:String,
        language:String,
        facebook:String,
        instagram:String,
        youtube:String,
        linkedin:String,
        twitter:String,
    },

    date: {
        type: Date,
        default: Date.now,
        required: true
    }
});

module.exports = mongoose.model('User', userSchema);