const express = require('express');
const router = express.Router()
const UserDetailsModel = require('../models/user-details.model');
const cloudinary = require('../utils/cloudinary');
const { authenticateToken } = require('../middlewares/authware');
const { singleUpload } = require('../middlewares/useMulter');
const { getDataUri } = require('../utils/dataURI');
const mongoose = require('mongoose');

router.get('/api/get-banner/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params
        let response = await UserDetailsModel.findOne({ user_id: id });
        res.send({ status: 'success', store_banner: response.store_banner, message: "Banner data successfully fetched!" })
    }
    catch (err) {
        console.log(err)
        res.send({ status: 'error', error: err, message: "Error occured while getting account details!" })
    }
})

router.patch('/api/update-user-details/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { occupation, store_details, store_banner } = req.body;
    let profile = (req.file) ? req.file.filename : null;

    try {
        let updates = { user_id: id };
        if (profile !== null) {
            updates.profileImg = profile;
        }
        if (store_details) {
            updates.store_details = {};
            const fieldsToUpdate = [
                'company_name',
                'rating',
                'foundedAt',
                'about',
                'address',
                'hours',
                'phoneNumber',
                'businessEmail'
            ];

            fieldsToUpdate.forEach((field) => {
                if (store_details[field]) {
                    updates.store_details[field] = store_details[field];
                }
            });
        }
        if (occupation) {
            updates.occupation = occupation;
        }
        await UserDetailsModel.findOneAndUpdate({ _id: id }, updates, { new: true, upsert: true, runValidators: true })
        res.send({ status: 'success', message: "account credentials updated!" })
    } catch (err) {
        console.log(err)
        res.send({ status: 'error', error: err, message: "Error occured while updating account details!" })
    }
})

router.patch('/api/upload-banner/:id', singleUpload, authenticateToken, async (req, res) => {
    const { id } = req.params;
    const file = req.file;
    if (file) {
        try {
            if (!file) {
                throw new Error('No file uploaded');
            }
            const fileType = file.mimetype;
            const fileUri = getDataUri(file);
            let resourceType = fileType.startsWith("video/") ? "video" : 'image';

            const videoResult = await cloudinary.uploader.upload(fileUri.content, {
                folder: 'store_headers',
                resource_type: resourceType,
            });

            const updateresponse = await UserDetailsModel.findByIdAndUpdate({ _id: id }, {
                user_id: id,
                store_banner: {
                    public_id: videoResult.public_id,
                    url: videoResult.secure_url,
                    type: fileType
                }
            },
                { new: true, upsert: true, runValidators: true }
            );

            res.status(200).json("Banner uploaded successfully!");
        } catch (error) {
            console.error(error);
            res.status(500).json("Error uploading video: " + error.message);
        }
    } else {
        res.status(500).json("File not found");
    }
});

router.get('/api/get-user-details/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params
        const pipeline = [
            {
                $match: { user_id: new mongoose.Types.ObjectId(id) }
            },
            {
                $lookup: {
                    from: 'user-data',
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'user_data'
                }
            },
            {
                $project: {
                    _id: 1,
                    profileImg: 1,
                    occupation: 1,
                    store_details: 1,
                    store_banner: 1,
                    createdAt: 1,
                    user_id: { $arrayElemAt: ["$user_data._id", 0] }, 
                    name: { $arrayElemAt: ["$user_data.name", 0] }, 
                    email: { $arrayElemAt: ["$user_data.email", 0] }, 
                    company: { $arrayElemAt: ["$user_data.company", 0] }
                }
            }
        ];

        const response = await UserDetailsModel.aggregate(pipeline);


        res.send({ status: 'success', response: response[0], message: "user details fetched successfully!" })
    }
    catch (err) {
        console.log(err)
        res.send({ status: 'error', error: err, message: "Error occured while getting account details!" })
    }
})
router.patch('/api/upload-banner/:id', singleUpload, authenticateToken, async (req, res) => {
    const { id } = req.params;
    const file = req.file;
    if (file) {
        try {
            if (!file) {
                throw new Error('No file uploaded');
            }
            const fileType = file.mimetype;
            const fileUri = getDataUri(file);
            let resourceType = fileType.startsWith("video/") ? "video" : 'image';

            const videoResult = await cloudinary.uploader.upload(fileUri.content, {
                folder: 'store_headers',
                resource_type: resourceType,
            });

            const updateresponse = await UserDetailsModel.findByIdAndUpdate({ _id: id }, {
                user_id: id,
                store_banner: {
                    public_id: videoResult.public_id,
                    url: videoResult.secure_url,
                    type: fileType
                }
            },
                { new: true, upsert: true, runValidators: true }
            );

            res.status(200).json("Banner uploaded successfully!");
        } catch (error) {
            console.error(error);
            res.status(500).json("Error uploading video: " + error.message);
        }
    } else {
        res.status(500).json("File not found");
    }
});

router.patch('/api/update-store-theme/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { store_theme } = req.body;

        const update = {
            $set: {
                'store_details.store_theme': store_theme
            }
        };

        await UserDetailsModel.findOneAndUpdate({ _id: id }, update)
        res.send({ status: 'success', message: "store theme updated successfully!" })
    } catch (err) {
        console.log(err)
        res.send({ status: 'error', error: err, message: "Error occured while updating account details!" })
    }
})

module.exports = router;