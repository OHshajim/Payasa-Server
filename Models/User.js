const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  number: {
    type: Number,
    require: true,
    unique: true,
  },
  email: {
    type: String,
    unique: true,
  },
  pin: {
    type: String,
    require: true,
    length: 5,
  },
  status: {
    type: String,
  },
  date:{
    type:String,
  },
  balance: {
    type: Number,
  },
});

const UserModel = mongoose.model("users", UserSchema);
module.exports = UserModel;
