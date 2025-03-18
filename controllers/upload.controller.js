const userModel = require('../models/user.model');
const objectID = require('mongoose').Types.ObjectId;
const fs = require('fs');
const path = require('path');
const { uploadErrors } = require('../utils/errors.utils');


module.exports.uploadProfile = async (req, res) => {
    console.log('Début de la fonction uploadProfile');

    try {
        console.log('Vérification de req.file');
        if (!req.file) {
            console.log('Aucun fichier uploadé');
            throw new Error('No file uploaded');
        }

        console.log('req.file:', req.file); // Affiche les détails du fichier uploadé

        // Vérifier le type de fichier
        console.log('Vérification du type de fichier');
        if (
            req.file.mimetype !== 'image/jpg' &&
            req.file.mimetype !== 'image/png' &&
            req.file.mimetype !== 'image/jpeg'
        ) {
            console.log('Format de fichier invalide:', req.file.mimetype);
            throw new Error('Invalid file format');
        }

        // Vérifier la taille du fichier
        console.log('Vérification de la taille du fichier');
        if (req.file.size > 500000) {
            console.log('Taille du fichier dépassée:', req.file.size);
            throw new Error('Max size exceeded');
        }

        // Générer un nom de fichier unique
        console.log('Génération du nom de fichier');
        const fileName = req.body.name + '.jpg';
        console.log('Nom du fichier:', fileName);

        // Chemin du fichier de destination
        const filePath = path.join(__dirname, '../client/public/upload/profil', fileName);
        console.log('Chemin du fichier:', filePath);

        // Vérifier si le dossier existe, sinon le créer
        const uploadDir = path.join(__dirname, '../client/public/upload/profil');
        if (!fs.existsSync(uploadDir)) {
            console.log('Création du dossier de destination');
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Écrire le fichier à partir du buffer
        console.log('Début de l\'écriture du fichier');
        fs.writeFileSync(filePath, req.file.buffer); // Utilise req.file.buffer
        console.log('Fichier écrit avec succès');

        // Mettre à jour le profil de l'utilisateur
        console.log('Mise à jour du profil de l\'utilisateur');
        const updateProfil = await userModel.findByIdAndUpdate(
            req.body.userId,
            { $set: { picture: './upload/profil/' + fileName } }, // Utilisez $set pour mettre à jour le champ
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        if (!updateProfil) {
            console.log('Utilisateur non trouvé');
            throw new Error('User not found');
        }

        // Renvoyer une réponse de succès
        console.log('Réponse de succès envoyée');
        res.status(200).json({ message: 'File uploaded and profile updated successfully!', updateProfil });
    } catch (error) {
        console.error('Erreur capturée:', error.message);

        // Gérer les erreurs
        console.log('Appel de uploadErrors');
        const errors = uploadErrors(error);
        console.log('Erreurs générées:', errors);

        res.status(400).json(errors);
    }
};