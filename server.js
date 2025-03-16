const express = require('express');
const app = express();
require('./config/db')
require('dotenv').config({path: './config/.env'})



app.listen(process.env.PORT, ()=> {
    console.log(`Listenning on Port ${process.env.PORT}`)
})