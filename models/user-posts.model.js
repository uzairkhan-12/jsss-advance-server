const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'user-data', required: true },
    title: { type: String, required: true },
    desc: { type: String, required: true },
    is_pin: { type: Boolean, required: true },
    createdAt: { type: Date, default: Date.now },
},
    { collection: 'posts' }
)

const PostsModel = mongoose.model('posts', postSchema);

module.exports = PostsModel