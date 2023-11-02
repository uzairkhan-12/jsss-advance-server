const mongoose = require('mongoose');

const UserDetailsSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'user-data', required: true },
    profileImg: { type: String },
    occupation: { type: String },
    store_details: {
        company_name: { type: String },
        rating: { type: Number },
        foundedAt: { type: Date },
        about: { type: String },
        address: { type: String },
        hours: [{
            id: Number,
            day: String,
            startTime: String,
            endTime: String
        }],
        phoneNumber: { type: String },
        businessEmail: { type: String },
        store_theme: { type: String, default: "primary" }
    },
    store_banner: {
        public_id: { type: String },
        url: { type: String },
        type: { type: String }
    },
    createdAt: { type: Date, default: Date.now },
},
    { collection: 'user-details' }
)

const UserDetailsModel = mongoose.model('userDetail', UserDetailsSchema);

module.exports = UserDetailsModel;