const userModel = require('../models/user.model');
const objectID = require("mongoose").Types.ObjectId;
const fs = require('fs');
const {promisify} = require('util');
const { uploadErrors } = require('../utils/errors.utils');
const pipeline = promisify(require('stream'));


module.exports.uploadProfile = async(req, res) => {
    try {
        if(req.file.detectedMimeType !== 'image/jpg' && req.file.detectedMimeType !== 'image/png' && req.file.detectedMimeType !== 'image/jpeg')
            throw Error("Invalid file ");
        if(req.file.size > 500000) throw Error("Max size ");
    } catch (error) {
        const errors =  uploadErrors(error)
        return res.status(201).json(errors)
    }

    const fileName = req.body.name + '.jpeg';

    await pipeline(
        req.file.stream,
        fs.createWriteStream(
            `${__dirname}/../client/public/upload/profil/${fileName}`
        )

    )
}