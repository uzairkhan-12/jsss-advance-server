const express = require('express');
const router = express.Router();
const PostsModel = require('../models/user-posts.model');

// fetch all posts 
router.get('/api/get-all-posts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let response = await PostsModel.find({ user_id: id })
        res.send({ status: 'success', data: response, message: "posts fetched successfully!" })
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
})


// Create a new post
router.post('/api/create-post', async (req, res) => {
   try {
       const { user_id, title, desc, is_pin } = req.body;
       const newPost = new PostsModel({
           user_id,
           title,
           desc,
           is_pin,
       });
       await newPost.save();

       res.status(201).json({ status: 'success', data: newPost, message: 'Post created successfully' });
   } catch (error) {
       console.error(error);
       res.status(500).json({ error: 'Internal Server Error' });
   }
});

router.get('/api/get-post/:post_id', async (req, res) => {
    try {
        const { post_id } = req.params;
        let response = await PostsModel.findOne({ _id: post_id })
        res.send({ status: 'success', data: response, message: "post fetched successfully!" })
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.patch('/api/edit-post/:id/:post_id', async (req,res) => {
    try {
        const {id, post_id} = req.params
        const { title, desc, is_pin } = req.body;
        const response = await PostsModel.findOneAndUpdate(
            { user_id: id, _id: post_id },
            { title, desc, is_pin },
            { new: true }
        );

        if (!response) {
            return res.status(404).json({ error: 'Post not found' });
        }

        res.json({ status: 'success', message: "Post updated successfully!", response })
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})


router.delete("/api/delete-post/:id/:post_id", async (req, res) => {
    try {
        const { id, post_id } = req.params;
        let response = await PostsModel.findOneAndDelete({
            _id: post_id,
            user_id: id,
        });
        if (response === null) {
            return res.status(422).json({ message: "post does not exist" });
        }
        res.send({ status: 'success', message: `post deleted successfully` })

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



module.exports = router;