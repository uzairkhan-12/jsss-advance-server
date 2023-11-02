require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const authRoute = require('./routes/auth.route');
const userDetailsRoute = require('./routes/user-details.route');
const productRoute = require('./routes/product.route');
const serviceRoute = require('./routes/service.route');
const storeRoute = require('./routes/store.route');
const adminRoute = require('./routes/admin.route');
const postRoute = require('./routes/user-post.route')


// configure database 
const mongoConnection = `${process.env.MONGODB_CONNECTION_STRING}/${process.env.MONGODB_NAME}`;
mongoose.connect(mongoConnection)
    .then(() => [
        console.log("Database connected successfully")
    ])
    .catch(err => {
        console.log("DB Connection Error: " + err)
    })

app.use('/public', express.static('public'));
app.use(express.json())
app.use(cors());
app.use(express.static('public'))

// routes
app.use('/auth', authRoute);
app.use('/user-details', userDetailsRoute);
app.use('/product', productRoute);
app.use('/service', serviceRoute);
app.use('/store', storeRoute);
app.use('/admin', adminRoute);
app.use('/post', postRoute);

app.get('/', (req, res) => {
    res.send("VOLT API WORKING")
})

app.listen(process.env.PORT, () => {
    console.log("SERVER RUNNING ON PORT: " + process.env.PORT)
})