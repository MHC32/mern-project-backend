const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/user.routes')
const app = express();
require('./config/db')
const {checkUser, requireAuth} = require('./middleware/auth.middleware')
require('dotenv').config({path: './config/.env'})


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

//jwt
app.get('*', checkUser)
app.get('/jwtid', requireAuth, (req, res)=> {
    res.status(200).send(res.locals.user._id)
})



//routes
app.use('/api/user', userRoutes); 





app.listen(process.env.PORT, ()=> {
    console.log(`Listenning on Port ${process.env.PORT}`)
})