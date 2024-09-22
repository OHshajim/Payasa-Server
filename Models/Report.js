const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Report = new Schema({
  number: {
    type: Number,
    require: true,
  },
  email: {
    type: String,
    require: true,
  },
  date: {
    type: String,
    require: true,
  },
  title: {
    type: String,
    require: true,
  },
  level: {
    type: String,
    require: true,
  },
  description: {
    type: String,
    require: true,
  },
});
const ReportModel = mongoose.model("Reports", Report);
module.exports = ReportModel;
