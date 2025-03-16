const mongoose = require("mongoose");

mongoose
  .connect("mongodb+srv://hantz:test@dbtest.immqx.mongodb.net/mern-project")
  .then(() => console.log("connected to MongoDB"))
  .catch((err)=> console.log('Failled to connected MongoDB',err))
