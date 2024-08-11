const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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
    Charge: {
      type: Number,
      require: true
    },
  });
const HistoryModel = mongoose.model("histories", AccountHistory);
module.exports =  HistoryModel ;
