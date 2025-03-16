const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/user.routes')
const app = express();
require('./config/db')
require('dotenv').config({path: './config/.env'})


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));



//routes
app.use('/api/user', userRoutes); 





app.listen(process.env.PORT, ()=> {
    console.log(`Listenning on Port ${process.env.PORT}`)
})