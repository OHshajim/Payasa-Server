const express = require("express");
const cors = require("cors");
require("dotenv").config();
const bodyParser = require("body-parser");
require("./Models/db");
const Authentication = require("./Router/Authentication");
const UserModel = require("./Models/User");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use("/authentication", Authentication);

app.get("/numberValidate/:number", async (req, res) => {
  const { number } = req.params;
  console.log(number);
  const result =await UserModel.findOne({ number: number });
  result? res.send({message:"User A/C is Valid",success:true,number:result.number}):res.send({success:false , message: "This user A/C is not valid !!!"})
});

// server running test
app.get("/", (req, res) => {
  res.send("Payasa server running ...");
});

app.listen(port, () => {
  console.log(`Payasa server listening on port ${port}`);
});
