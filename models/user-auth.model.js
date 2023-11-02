const mongoose = require('mongoose');

const UserAuthSchema = new mongoose.Schema({
    name : {type: String, required:true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    company : {type: String, required: true, unique: true},
    createdAt: {type: Date, default: Date.now},
    role: {type: String, default: "user"},
},
{collection: 'user-data'})

const UserAuthModel = mongoose.model('auth', UserAuthSchema);

module.exports = UserAuthModel;