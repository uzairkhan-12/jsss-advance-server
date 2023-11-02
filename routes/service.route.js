const express = require('express');
const router = express.Router();
const ServiceModel = require('../models/service.model');
const { muplitpleUploads } = require('../middlewares/useMulter');
const cloudinary = require('../utils/cloudinary');
const { authenticateToken } = require('../middlewares/authware');

// fetch all services 
router.get('/api/get-all-services/:id', async (req, res) => {
    const { id } = req.params;
    try {
        let response = await ServiceModel.find({ user_id: id })
        res.send({ status: 'success', data: response, message: "services fetched successfully!" })
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

// fetch single service
router.get('/api/get-service/:service_id', async (req, res) => {
    const { service_id } = req.params;
    try {
        let response = await ServiceModel.findOne({ _id: service_id })
        res.send({ status: 'success', data: response, message: "service fetched successfully!" })
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

// update single service 
router.patch('/api/update-service/:id/:service_id', authenticateToken, muplitpleUploads, async (req, res) => {
    const { id, service_id } = req.params;
    const { title, sub_heading, desc, price, availablity, tags } = req.body;
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

        const response = await ServiceModel.findOneAndUpdate(
            { user_id: id, _id: service_id },
            { title, sub_heading, desc, price, availablity, $push: { posters: posterUrls,tags: JSON.parse(tags) } },
            { new: true }
        );

        if (!response) {
            return res.status(404).json({ error: 'service not found' });
        }

        res.send({ status: 'success', message: "service updated successfully!", response})
    } catch (error) {
        console.log({ error })
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

// create service 
router.post('/api/create-service', authenticateToken, muplitpleUploads, async (req, res) => {
    const { id, title, sub_heading, desc, price, availablity, tags } = req.body;
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

        let response = await ServiceModel.create({
            user_id: id,
            title,
            sub_heading,
            desc,
            price,
            availablity,
            tags: JSON.parse(tags),
            posters: posterUrls,
        });

        res.status(200).json({ status: 'service created successfully',service:response } );
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// delete single service 
router.delete("/api/delete-service/:id/:service_id", authenticateToken, async (req, res) => {
    const { id, service_id } = req.params;
    try {
        let response = await ServiceModel.findOneAndDelete({
            _id: service_id,
            user_id: id,
        });
        if (response === null) {
            return res.status(422).json({ message: "service does not exist" });
        }
        res.send({ status: 'success', message: `service ${response.name} deleted successfully` })

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// delete single service poster 
router.put("/api/delete-service-poster/:id/:service_id", authenticateToken, async (req, res) => {
    const { id, service_id } = req.params;
    const poster_id = req.body.poster_id;
    try {
        const response = await ServiceModel.findOneAndUpdate({
            _id: service_id,
            user_id: id,
        },
            { $pull: { posters: { _id: poster_id } } }
        );
        if (!response) {
            return res.status(404).json({ error: 'service not found or user does not have permission' });
        }
        res.send({ status: 'success', message: `service poster deleted successfully` })
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// delete single service tag 
router.put("/api/delete-service-tag/:id/:service_id", authenticateToken, async (req, res) => {
    const { id, service_id } = req.params;
    const tag_id = req.body.tag_id;
    try {
        const response = await ServiceModel.findOneAndUpdate({
            _id: service_id,
            user_id: id,
        },
            { $pull: { tags: { _id: tag_id } } }
        );
        if (!response) {
            return res.status(404).json({ error: 'service not found or user does not have permission' });
        }
        res.send({ status: 'success', message: `service poster deleted successfully` })
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



module.exports = router;