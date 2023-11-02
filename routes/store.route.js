const express = require('express');
const router = express.Router();
const UserAuthModel = require('../models/user-auth.model');

router.get('/api/get-all-for-store/:company', async (req, res) => {
    const { company } = req.params;
    try {
        let response = await UserAuthModel.aggregate([
            {
                $match: {
                    company: company,
                }
            },
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
                $lookup: {
                    from: "posts",
                    localField: "_id",
                    foreignField: "user_id",
                    as: "posts"
                }
            },
            {
                $limit: 1,
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    email: 1,
                    company: 1,
                    products: 1,
                    services: 1,
                    posts: 1,
                    user_details: 1,
                }
            }
        ]);
        res.send({ status: 'success', response: response[0], message: "store data fetched successfully!" })
    } catch (error) {
        console.log({ error })
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

module.exports = router;