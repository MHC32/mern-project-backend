const userModel = require('../models/user.model');
const objectID = require('mongoose').Types.ObjectId;



module.exports.getAllUsers = async (req, res) => {
    const users = await userModel.find().select('-password');
    res.status(200).json(users)
}


module.exports.userInfo = async (req, res) => {
    console.log(req.params);
    if (!objectID.isValid(req.params.id)) {
      return res.status(400).send('ID Unknown : ' + req.params.id);
    }
  
    try {
      const user = await userModel.findById(req.params.id).select('-password');
      if (!user) {
        return res.status(404).send('User not found');
      }
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };