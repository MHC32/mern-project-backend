const postModel = require('../models/post.model');
const userModel = require('../models/user.model'); 
const objectID = require("mongoose").Types.ObjectId;


module.exports.readPost = async (req, res) => {
    try {
      const posts = await postModel.find();
      if (posts.length === 0) {
        return res.status(404).json({ message: 'No posts found' });
      }
      res.status(200).json(posts);
    } catch (err) {
      console.log('Error to get data:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  };


module.exports.createPost = async (req, res) => {
    const newPost = new postModel({
        posterId: req.body.posterId,
        message : req.body.message,
        video: req.body.video,
        likers: [],
        comments: [],
    });

    try {
         const post = await newPost.save()
         res.status(201).json(post)
    } catch (err) {
        return  res.status(400).send(err)
    }
}


module.exports.updatePost = async (req, res) => {
    if (!objectID.isValid(req.params.id)) {
      return res.status(400).send('ID Unknown : ' + req.params.id);
    }
  
    const updatedRecord = {
      message: req.body.message,
    };
  
    try {
      const post = await postModel.findByIdAndUpdate(
        req.params.id,
        { $set: updatedRecord },
        { new: true } 
      );
  
      if (!post) {
        return res.status(404).send('Post not found');
      }
  
      res.status(200).json(post);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };


  module.exports.delePost = async (req, res) => {
    if (!objectID.isValid(req.params.id)) {
      return res.status(400).send('ID Unknown : ' + req.params.id);
    }
  
    try {
      const deletedPost = await postModel.findByIdAndDelete(req.params.id);
      if (!deletedPost) {
        return res.status(404).send('Post not found');
      }
      res.status(200).json({ message: 'Post deleted successfully', deletedPost });
    } catch (err) {
      console.log('Delete Error:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  };



  module.exports.likePost = async (req, res) => {
    // Valider l'ID du post
    if (!objectID.isValid(req.params.id)) {
        return res.status(400).json({ message: 'Invalid post ID: ' + req.params.id });
    }

    // Valider l'ID de l'utilisateur
    if (!objectID.isValid(req.body.id)) {
        return res.status(400).json({ message: 'Invalid user ID: ' + req.body.id });
    }

    try {
        // 1. Ajouter l'utilisateur aux likers du post
        const updatedPost = await postModel.findByIdAndUpdate(
            req.params.id,
            { 
                $addToSet: { likers: req.body.id } // Ajoute l'ID de l'utilisateur aux likers
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        // Si le post n'est pas trouvé
        if (!updatedPost) {
            return res.status(404).json({ message: 'Post not found: ' + req.params.id });
        }

        // 2. Ajouter le post aux likes de l'utilisateur
        const updatedUser = await userModel.findByIdAndUpdate(
            req.body.id,
            {
                $addToSet: { likes: req.params.id } // Ajoute l'ID du post aux likes de l'utilisateur
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        // Si l'utilisateur n'est pas trouvé
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found: ' + req.body.id });
        }

        // Réponse de succès
        res.status(200).json({
            message: 'Post liked successfully!',
            post: updatedPost,
            user: updatedUser,
        });
    } catch (error) {
        // Gestion des erreurs
        res.status(500).json({ message: 'Internal server error: ' + error.message });
    }
};



  module.exports.unlikePost = async(req, res) => {
    
  }