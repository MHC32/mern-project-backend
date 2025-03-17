const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    posterID: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    picture: {
      type: String,
    },

    video: {
      type: String,
    },

    likers: {
      type: [String],
      required: true,
    },

    comments: {
      type: [
        {
          commentId: String,
          commenterPseudo: String,
          text: String,
          timestamp: Number,
        },
      ],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);


module.exports = mongoose.model('post', postSchema);