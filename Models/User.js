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
    require: true,
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
  balance: {
    type: Number,
  },
});

const AccountHistory = new Schema({
  Service: {
    type: String,
    require: true,
  },
  From: {
    type: Number,
    require: true,
  },
  To: {
    type: Number,
    require: true,
  },
  Date: {
    type: String,
    require: true,
  },
  Amount: {
    type: Number,
    require: true
  },
});

const UserModel = mongoose.model("users", UserSchema);
const HistoryModel = mongoose.model("histories", AccountHistory);
module.exports = { UserModel, HistoryModel };
