const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Feedbacks = new Schema({
  number: {
    type: Number,
    require: true,
  },
  email: {
    type: String,
  },
  date: {
    type: String,
    require: true,
  },
  rating: {
    type: Number,
    require: true,
  },
  comment: {
    type: String,
    require: true,
  },
});
const FeedbacksModel = mongoose.model("Feedbacks", Feedbacks);
module.exports = FeedbacksModel;
