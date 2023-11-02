const mongoose = require('mongoose');

const tagsSchema = new mongoose.Schema({
    tag:String
})

const ServiceSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'user-data', required: true },
    posters: [
        { url: { type: String } }
    ],
    title: { type: String, required: true },
    sub_heading: { type: String, required: true },
    desc: { type: String, required: true },
    rating: { type: Number },
    tags: {type: [tagsSchema]},
    price: { type: Number, required: true },
    discount: { type: Number },
    availablity: { type: Boolean, required: true },
    options: { type: String },
    reviews: [
        {
            rating: { type: Number },
            comment: { type: String }
        }
    ],
    createdAt: { type: Date, default: Date.now },
},
    { collection: 'services' }
)

const ServiceModel = mongoose.model('service', ServiceSchema);

module.exports = ServiceModel;