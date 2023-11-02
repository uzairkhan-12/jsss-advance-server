const mongoose = require('mongoose');

const tagsSchema = new mongoose.Schema({
    tag:String
})

const ProductSchema = new mongoose.Schema({
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
    quantity: { type: Number, required: true },
    options: { type: String },
    reviews: [
        {
            rating: { type: Number },
            comment: { type: String }
        }
    ],
    createdAt: { type: Date, default: Date.now },
},
    { collection: 'products' }
)

const ProductModel = mongoose.model('product', ProductSchema);

module.exports = ProductModel;