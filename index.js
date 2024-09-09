const express = require("express");
const cors = require("cors");
require("dotenv").config();
require("./Models/db");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 5000;
const UserModel = require("./Models/User");
const HistoryModel = require("./Models/History");
const Authentication = require("./Router/Authentication");
const TokenValidate = require("./Middleware/TokenValidate");
const RequestModel = require("./Models/MoneyRequest");

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
        status: result.status,
        number: result.number,
      })
    : res.send({ success: false, message: "This user A/C is not valid !!!" });
});

// Agent
app.get("/addMoneyRequests/:number", async (req, res) => {
  const { number } = req.params;
  console.log(number);
  const result = await RequestModel.find({ number: number });
  result
    ? res.send(result)
    : res.send({ success: false, message: "Server error!" });
});

app.post("/moneyTransfer/:number", async (req, res) => {
  try {
    const { number } = req.params;
    const user = req.body;
    const receiverNumber = user.number;
    const amount = parseFloat(user.amount);
    const charge = parseFloat(user.charge);

    // Find sender and receiver
    const from = await UserModel.findOne({ number });
    const to = await UserModel.findOne({ number: receiverNumber });

    if (!from || !to) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Check if sender has enough balance
    if (from.balance < amount + charge) {
      return res.status(400).json({
        message: "Insufficient balance",
        success: false,
      });
    }

    const fromDocument = {
      $inc: {
        balance: -(amount + charge),
      },
    };

    let toDocument;
    if (user.service === "Send Money") {
      toDocument = {
        $inc: {
          balance: amount,
        },
      };
    } else {
      toDocument = {
        $inc: {
          balance: amount + charge,
        },
      };
    }

    const fromUpdate = await UserModel.updateOne(
      { _id: from._id },
      fromDocument
    );

    const toUpdate = await UserModel.updateOne({ _id: to._id }, toDocument);
    console.log(fromUpdate, toUpdate);
    const statement = new HistoryModel({
      Service: user.service,
      From: from.number,
      To: to.number,
      Date: new Date(),
      Amount: amount,
      Charge: charge,
    });
    console.log(statement);

    if (fromUpdate.modifiedCount && toUpdate.modifiedCount) {
      console.log("condition true");

      await statement.save();
      res.status(201).json({
        message: "Successfully Transferred",
        success: true,
      });
    } else {
      res.status(500).json({
        message: "Transfer failed",
        success: false,
      });
      zzzzzzzzz;
    }
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      success: false,
      error: error.message,
    });
  }
});

app.post("/addMoney/:number", async (req, res) => {
  const user = req.body;
  const To = req.params;
  console.log(user, To);
  const RequestData = await RequestModel({
    To: To.number,
    From: user.number,
    Date: new Date(),
    Amount: user.amount,
    Status: "Pending",
  });
  console.log(RequestData);
  await RequestData.save();
  res.status(201).json({
    message: "Request Send successfully",
    success: true,
  });
});

// Admin
app.get("/allUsers", async (req, res) => {
  const { query, search } = req.query;
  if (query) {
    const result = await UserModel.find({ status: query });
    return res.send(result).status(200);
  } 
  else if (search) {
    const result = await UserModel.find({
      number: { $regex: search, $options: "i" },
    });
    return res.send(result).status(200);
  }
   else {
    const result = await UserModel.find();
    res.send(result).status(200);
  }

  // const result = await UserModel.find();
});

// server running test
app.get("/", (req, res) => {
  res.send("Payasa server running ...");
});

app.listen(port, () => {
  console.log(`Payasa server listening on port ${port}`);
});
