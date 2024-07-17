const mongoose = require("mongoose");
const DB_URL = process.env.DB_KEY;
mongoose
  .connect(DB_URL)
  .then(() => {
    console.log("Mongodb Connected Successfully");
  })
  .catch((err) => {
    console.log("MongoDB connection error : ", err);
  });
