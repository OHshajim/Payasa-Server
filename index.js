const express = require("express");
const cors = require("cors");
require("dotenv").config();
require("./Models/db");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 5000;
const { UserModel, HistoryModel } = require("./Models/User");
const Authentication = require("./Router/Authentication");
const TokenValidate = require("./Middleware/TokenValidate");

// middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use("/authentication", Authentication);

app.get("/userDetails/:id", async (req, res) => {
  const { id } = req.params;
  console.log(id);
  const result = await UserModel.findOne({ _id: id });
  const user = {
    number: result.number,
    email: result.email,
    status: result.status,
    balance: result.balance,
  };
  res.send(user);
});

app.get("/numberValidate/:number", async (req, res) => {
  const { number } = req.params;
  console.log(number);
  const result = await UserModel.findOne({ number: number });
  result
    ? res.send({
        message: "User A/C is Valid",
        success: true,
        number: result.number,
      })
    : res.send({ success: false, message: "This user A/C is not valid !!!" });
});

app.post("/sendmoney/:number", async (req, res) => {
  const { number } = req.params;
  const user = req.body;
  const receiverNumber = user.number;
  const amount = parseFloat(user.amount);
  const from = await UserModel.findOne({ number: number });
  const to = await UserModel.findOne({ number: receiverNumber });
  const fromDocument = {
    $inc: {
      balance: -amount,
    },
  };
  const toDocument = {
    $inc: {
      balance: amount,
    },
  };
  const From = await UserModel.updateOne({ _id: from._id }, fromDocument);
  const To = await UserModel.updateOne({ _id: to._id }, toDocument);
  console.log(To, From);

  const statement = new HistoryModel({
    Service: "Send Money",
    From: from.number,
    To: to.number,
    Date: Date(),
    Amount: amount,
  });
  console.log(statement);
  
  if (To.modifiedCount && From.modifiedCount) {
    const result = await statement.save()
    console.log(result);
  }
});

// server running test
app.get("/", (req, res) => {
  res.send("Payasa server running ...");
});

app.listen(port, () => {
  console.log(`Payasa server listening on port ${port}`);
});
