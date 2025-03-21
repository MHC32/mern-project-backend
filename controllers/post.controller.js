const postModel = require('../models/post.model');
const userModel = require('../models/user.model'); 
const { uploadErrors } = require('../utils/errors.utils')
const objectID = require("mongoose").Types.ObjectId;
const path = require('path'); 
const fs = require('fs');
const { promisify } = require('util');
const writeFileAsync = promisify(fs.writeFile);


module.exports.readPost = async (req, res) => {
    try {
      const posts = await postModel.find().sort({createdAt: -1});
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
    console.log('Début de la fonction createPost');
  
    let filename = null;
  
    // Gestion de l'upload de fichier (image ou vidéo)
    if (req.file !== null) {
      console.log('Fichier uploadé détecté');
      try {
        console.log('Vérification du type de fichier');
        if (
          req.file.mimetype !== 'image/jpg' &&
          req.file.mimetype !== 'image/png' &&
          req.file.mimetype !== 'image/jpeg' &&
          req.file.mimetype !== 'video/mp4' &&
          req.file.mimetype !== 'video/quicktime'
        ) {
          console.log('Format de fichier invalide:', req.file.mimetype);
          throw new Error('Invalid file format');
        }
  
        console.log('Vérification de la taille du fichier');
        if (req.file.size > 5000000) { // 5 Mo max
          console.log('Taille du fichier dépassée:', req.file.size);
          throw new Error('Max size exceeded');
        }
  
        console.log('Génération du nom de fichier');
        filename = req.body.posterId + Date.now() + '.jpg';
        console.log('Nom du fichier généré:', filename);
  
        // Chemin du fichier de destination
        const filePath = path.join(__dirname, '../client/public/uploads/posts', filename);
        console.log('Chemin du fichier de destination:', filePath);
  
        // Vérifier si le dossier existe, sinon le créer
        const uploadDir = path.join(__dirname, '../client/public/uploads/posts');
        console.log('Vérification du dossier de destination:', uploadDir);
        if (!fs.existsSync(uploadDir)) {
          console.log('Création du dossier de destination');
          fs.mkdirSync(uploadDir, { recursive: true });
        }
  
        // Écrire le fichier à partir du buffer
        console.log('Écriture du fichier sur le disque');
        fs.writeFileSync(filePath, req.file.buffer);
        console.log('Fichier écrit avec succès');
      } catch (error) {
        console.error('Erreur lors de l\'upload du fichier:', error.message);
        const errors = uploadErrors(error);
        return res.status(400).json(errors);
      }
    } else {
      console.log('Aucun fichier uploadé');
    }
  
    // Création du post
    console.log('Création du post');
    const newPost = new postModel({
      posterId: req.body.posterId,
      message: req.body.message,
      picture: req.file && (req.file.mimetype.includes('image')) ? './uploads/posts/' + filename : null,
      video: req.file && (req.file.mimetype.includes('video')) ? './uploads/posts/' + filename : null,
      likers: [],
      comments: [],
    });
  
    try {
      console.log('Enregistrement du post dans la base de données');
      const post = await newPost.save();
      console.log('Post enregistré avec succès:', post);
      res.status(201).json(post);
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement du post:', err.message);
      res.status(400).json({ message: err.message });
    }
  };

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
                $pull : { likers: req.body.id } // Ajoute l'ID de l'utilisateur aux likers
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
                $pull: { likes: req.params.id } // Ajoute l'ID du post aux likes de l'utilisateur
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        // Si l'utilisateur n'est pas trouvé
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found: ' + req.body.id });
        }

        // Réponse de succès
        res.status(200).json({
            message: 'Post uniked successfully!',
            post: updatedPost,
            user: updatedUser,
        });
    } catch (error) {
        // Gestion des erreurs
        res.status(500).json({ message: 'Internal server error: ' + error.message });
    }  
  }



  module.exports.commentPost = async (req, res) => {
    // Valider l'ID du post
    if (!objectID.isValid(req.params.id)) {
        return res.status(400).json({ message: 'Invalid post ID: ' + req.params.id });
    }

    // Valider les champs obligatoires
    if (!req.body.commenterId || !req.body.commenterPseudo || !req.body.text) {
        return res.status(400).json({ message: 'Missing required fields: commenterId, commenterPseudo, or text' });
    }

    try {
        // Ajouter le commentaire au post
        const updatedPost = await postModel.findByIdAndUpdate(
            req.params.id,
            {
                $push: {
                    comments: {
                        commenterId: req.body.commenterId,
                        commenterPseudo: req.body.commenterPseudo,
                        text: req.body.text,
                        timestamp: new Date().getTime(),
                    }
                }
            },
            { new: true } // Renvoie le document mis à jour
        );

        // Si le post n'est pas trouvé
        if (!updatedPost) {
            return res.status(404).json({ message: 'Post not found: ' + req.params.id });
        }

        // Réponse de succès
        res.status(200).json({
            message: 'Comment added successfully!',
            post: updatedPost,
        });
    } catch (error) {
        // Gestion des erreurs
        res.status(500).json({ message: 'Internal server error: ' + error.message });
    }
};

module.exports.editCommentPost = async (req, res) => {
    // Valider l'ID du post
    if (!objectID.isValid(req.params.id)) {
        return res.status(400).json({ message: 'Invalid post ID: ' + req.params.id });
    }

    // Valider l'ID du commentaire et le texte
    if (!req.body.commentId || !req.body.text) {
        return res.status(400).json({ message: 'Missing required fields: commentId or text' });
    }

    try {
        // Trouver le post
        const post = await postModel.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found: ' + req.params.id });
        }

        // Trouver le commentaire à modifier
        const comment = post.comments.id(req.body.commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found: ' + req.body.commentId });
        }

        // Mettre à jour le texte du commentaire
        comment.text = req.body.text;

        // Sauvegarder le post mis à jour
        const updatedPost = await post.save();

        // Réponse de succès
        res.status(200).json({
            message: 'Comment updated successfully!',
            post: updatedPost,
        });
    } catch (error) {
        // Gestion des erreurs
        res.status(500).json({ message: 'Internal server error: ' + error.message });
    }
};

module.exports.deleteCommentPost = async (req, res) => {
    // Valider l'ID du post
    if (!objectID.isValid(req.params.id)) {
        return res.status(400).json({ message: 'Invalid post ID: ' + req.params.id });
    }

    // Valider l'ID du commentaire
    if (!req.body.commentId) {
        return res.status(400).json({ message: 'Missing required field: commentId' });
    }

    try {
        // Trouver le post
        const post = await postModel.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found: ' + req.params.id });
        }

        // Trouver le commentaire à supprimer
        const comment = post.comments.id(req.body.commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found: ' + req.body.commentId });
        }

        // Supprimer le commentaire du tableau `comments`
        post.comments.pull(req.body.commentId);

        // Sauvegarder le post mis à jour
        const updatedPost = await post.save();

        // Réponse de succès
        res.status(200).json({
            message: 'Comment deleted successfully!',
            post: updatedPost,
        });
    } catch (error) {
        // Gestion des erreurs
        res.status(500).json({ message: 'Internal server error: ' + error.message });
    }
};