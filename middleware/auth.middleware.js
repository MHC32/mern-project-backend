const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');

module.exports.checkUser = async (req, res, next) => {
  const token = req.cookies.jwt;

  if (token) {
    jwt.verify(token, process.env.TOKEN_SECRET, async (err, decodedToken) => {
      if (err) {
        res.locals.user = null;
        res.cookie('jwt', '', { maxAge: 1 });
        next();
      } else {
        try {
          const userId = decodedToken.id;
            console.log('decodedToken ', decodedToken)
          let user = await userModel.findById(userId);
          res.locals.user = user;
          console.log(res.locals.user);
          next();
        } catch (error) {
          res.locals.user = null;
          res.cookie('jwt', '', { maxAge: 1 }); 
        }
      }
    });
  } else {
    res.locals.user = null;
    next();
  }
};