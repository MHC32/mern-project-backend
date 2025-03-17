const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    pseudo: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 55,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      validate: [isEmail],
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      max: 1024,
      minLength: 6,
    },

    picture:{
        type: String,
        default: '/uploads/profile/random-user.png'
    },
    bio: {
      type: String,
      max: 24,
    },
    followers: {
      type: [String],
    },
    following: {
      type: [String],
    },
    likes: {
      type: [String],
    },
  },
  {
    timestamps: true,
  }
);

//Play function before  save into DB
userSchema.pre("save", async function(next) {
    salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
}) 

userSchema.statics.login = async function (email, password ){
  const user = await this.findOne({ email })
  if(user){
    const auth = await bcrypt.compare(password , user.password)
    if(auth){
      return user 
    }
    throw Error('Incorect password ')
  }
  throw Error('Incorect email ')
}
 

module.exports = mongoose.model('user', userSchema); 