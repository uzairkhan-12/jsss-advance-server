const express = require('express');
const router = express.Router();
const UserAuthModel = require('../models/user-auth.model');
const { authenticateIsAdmin } = require('../middlewares/authware');

router.get('/api/get-all-users-detail', authenticateIsAdmin, async (req, res) => {
    try {
        
        let response = await UserAuthModel.aggregate([
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "user_id",
                    as: "products"
                }
            },
            {
                $lookup: {
                    from: "services",
                    localField: "_id",
                    foreignField: "user_id",
                    as: "services"
                }
            },
            {
                $lookup: {
                    from: "user-details",
                    localField: "_id",
                    foreignField: "user_id",
                    as: "user_details"
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    email: 1,
                    company: 1,
                    role: 1,
                    products: 1,
                    services: 1,
                    user_details: 1,
                }
            }
        ]);
        res.send({ status: 'success', response: response, message: "store data fetched successfully!" })
    } catch (error) {
        console.log({ error })
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

router.delete('/api/delete-user/:id', authenticateIsAdmin, async (req, res) => {
    try {
        await UserAuthModel.deleteOne({ _id: req.params.id })
        res.send({ status: 'success', response: req.params.id, message: "user deleted successfully!" })
    }
    catch (err) {
        console.log('catch', err)
        res.json(err)
    }
})

module.exports = router;