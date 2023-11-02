const express = require('express');
const router = express.Router()
const UserAuthModel = require('../models/user-auth.model');
const cloudinary = require('../utils/cloudinary');
const { authenticateToken } = require('../middlewares/authware');
const { getDataUri } = require('../utils/dataURI');

// get single account data 
router.post('/api/get-account-data', authenticateToken, async (req, res) => {
    const { email } = req.body
    if (email) {
        try {
            const user = await UserAuthModel.findOne({ email: email });
            res.json({ user: user });
        } catch (error) {
            res.json("user not found")
            console.log(error)
        }
    } else {
        res.status(403).json("Unauthorized request for getting user!");
    }
})

// update account data 
// imageUpload.single('image'),
router.patch('/api/update-account/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name, email, occupation, company, store_details } = req.body;
    let profile = (req.file) ? req.file.filename : null;
    if (profile !== null) {
        await UserAuthModel.findByIdAndUpdate(id, { profileImg: profile })
    }
    try {
        if (store_details) {
            try {
                await UserAuthModel.findByIdAndUpdate(id, { name, email, occupation, company })
                res.send({ status: 'success', message: "account details updated!" })
            } catch (error) {
                res.send({ status: 'error', error: err, message: "error occured while updating store details!" })
            }
        }
        await UserAuthModel.findByIdAndUpdate(id, { name, email, occupation, company })
        res.send({ status: 'success', message: "account credentials updated!" })
    } catch (err) {
        console.log(err)
        res.send({ status: 'error', error: err, message: "Error occured while updating account credentials!" })
    }
})

// uploading header video 
// singleUpload
router.patch('/api/upload-video/:id', async (req, res) => {
    const { id } = req.params;
    const file = req.file;
    try {
        if (!file) {
            throw new Error('No file uploaded');
        }
        const fileUri = getDataUri(file);
        const videoResult = await cloudinary.uploader.upload(fileUri.content, {
            folder: 'store_headers'
        });

        await UserAuthModel.findByIdAndUpdate(id, {
            store_header: {
                public_id: videoResult.public_id,
                url: videoResult.secure_url
            }
        });

        res.status(200).json("Video uploaded successfully!");
    } catch (error) {
        console.error(error);
        res.status(500).json("Error uploading video: " + error.message);
    }
});

module.exports = router;
