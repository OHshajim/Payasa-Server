const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MoneyRequest = new Schema({
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
  Status: {
    type: String,
    require: true,
  },
  Amount: {
    type: Number,
    require: true,
  },
});
const RequestModel = mongoose.model("money_request", MoneyRequest);
module.exports = RequestModel;
