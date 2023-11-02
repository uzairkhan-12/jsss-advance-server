const express = require('express');
const router = express.Router();
const ProductModel = require('../models/product.model');
const { muplitpleUploads } = require('../middlewares/useMulter');
const cloudinary = require('../utils/cloudinary');
const { authenticateToken } = require('../middlewares/authware');

// fetch all products 
router.get('/api/get-all-products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        let response = await ProductModel.find({ user_id: id })
        res.send({ status: 'success', data: response, message: "products fetched successfully!" })
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

// fetch single product
router.get('/api/get-product/:product_id', async (req, res) => {
    const { product_id } = req.params;
    try {
        let response = await ProductModel.findOne({ _id: product_id })
        res.send({ status: 'success', data: response, message: "product fetched successfully!" })
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

// update single product 
router.patch('/api/update-product/:id/:product_id', muplitpleUploads, async (req, res) => {
    const { id, product_id } = req.params;
    const { title, sub_heading, desc, price, quantity, tags } = req.body;
    const posterUrls = [];

    try {
        const uploadPromises = req.files.map((file) => {
            return new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    { resource_type: 'auto' },
                    (error, result) => {
                        if (error) {
                            console.error('Cloudinary Upload Error:', error);
                            return reject(error);
                        }
                        posterUrls.push({ url: result.secure_url });
                        resolve();
                    }
                ).end(file.buffer);
            });
        });

        await Promise.all(uploadPromises);

        const response = await ProductModel.findOneAndUpdate(
            { user_id: id, _id: product_id },
            { title, sub_heading, desc, price, quantity, $push: { posters: posterUrls, tags: JSON.parse(tags) } },
            { new: true }
        );

        if (!response) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.send({ status: 'success', message: "product updated successfully!", response })
    } catch (error) {
        console.log({ error })
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

// create product 
router.post('/api/create-product', muplitpleUploads, async (req, res) => {
    const { id, title, sub_heading, desc, price, quantity, tags } = req.body;
    const posterUrls = [];

    try {
        const uploadPromises = req.files.map((file) => {
            return new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    { resource_type: 'auto' },
                    (error, result) => {
                        if (error) {
                            console.error('Cloudinary Upload Error:', error);
                            return reject(error);
                        }
                        posterUrls.push({ url: result.secure_url });
                        resolve();
                    }
                ).end(file.buffer);
            });
        });

        await Promise.all(uploadPromises);

        let response = await ProductModel.create({
            user_id: id,
            title,
            sub_heading,
            desc,
            price,
            quantity,
            tags: JSON.parse(tags),
            posters: posterUrls,
        });
        res.status(200).json({ status: 'Post created successfully', product: response });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// delete single product 
router.delete("/api/delete-product/:id/:product_id", async (req, res) => {
    const { id, product_id } = req.params;
    try {
        let response = await ProductModel.findOneAndDelete({
            _id: product_id,
            user_id: id,
        });
        if (response === null) {
            return res.status(422).json({ message: "product does not exist" });
        }
        res.send({ status: 'success', message: `product ${response.name} deleted successfully` })

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// delete single product poster 
router.put("/api/delete-product-poster/:id/:product_id", async (req, res) => {
    const { id, product_id } = req.params;
    const poster_id = req.body.poster_id;
    console.log({poster_id})
    try {
        const response = await ProductModel.findOneAndUpdate({
            _id: product_id,
            user_id: id,
        },
            { $pull: { posters: { _id: poster_id } } }
        );
        if (!response) {
            return res.status(404).json({ error: 'Product not found or user does not have permission' });
        }
        res.send({ status: 'success', message: `product poster deleted successfully` })
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// delete single product tag 
router.put("/api/delete-product-tag/:id/:product_id", async (req, res) => {
    const { id, product_id } = req.params;
    const tag_id = req.body.tag_id;
    try {
        const response = await ProductModel.findOneAndUpdate({
            _id: product_id,
            user_id: id,
        },
            { $pull: { tags: { _id: tag_id } } }
        );
        if (!response) {
            return res.status(404).json({ error: 'Product not found or user does not have permission' });
        }
        res.send({ status: 'success', message: `product poster deleted successfully` })
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;