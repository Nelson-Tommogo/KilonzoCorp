const express = require('express');
const app = express();
require('dotenv').config();
const port = process.env.PORT;

const mongoose = require('mongoose');

const mpesaRoutes = require('./routes/mpesa');

mongoose
    .connect(process.env.DB, {
        useNewUrlParser: true,
    })
    .then(() => {
        console.log('Connected successfully to the database');
    })
    .catch((err) => console.log(err));

app.use('/api', mpesaRoutes);

app.listen(port, () => {
    console.log(`The app is running on port ${port}`);
});

