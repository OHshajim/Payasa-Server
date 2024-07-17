const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  Number: {
    type: Number,
    require: true,
    unique: true,
  },
  email: {
    type: String,
    require: true,
    unique: true,
  },
  pin: {
    type: Number,
    require: true,
    length: 5,
  },
});

const UserModel = mongoose.model('Users',UserSchema);
module.exports= UserModel;