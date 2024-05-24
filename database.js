const express = require('express');
const mongoose = require('mongoose');

require('dotenv').config();


const mogooseURI = `${process.env.MONGO_URL}`;

mongoose.connect(mogooseURI, {});

var db = mongoose.connection;

db.on('connected', function(){
    console.log('Connect to mongoose successfully...');
})

module.exports = db;