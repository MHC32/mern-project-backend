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

  module.exports.updateUser = async (req, res) => {
    if (!objectID.isValid(req.params.id)) {
      return res.status(400).send('ID Unknown : ' + req.params.id);
    }
  
    try {
      const updatedUser = await userModel.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            bio: req.body.bio,
          },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
  
      if (!updatedUser) {
        return res.status(404).send('User not found');
      }
  
      res.status(200).json(updatedUser);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };


  module.exports.deleteUser = async(req, res) => {
    if (!objectID.isValid(req.params.id)) {
        return res.status(400).send('ID Unknown : ' + req.params.id);
      }

    try {
         const deleteUser = await userModel.deleteOne({_id: req.params.id});
         if(deleteUser.deletedCount === 0){
            return res.status(404).send('User not found');
         }
         res.status(200).send({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: err.message });
    }
  }