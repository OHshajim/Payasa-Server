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
  // console.log(id);
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
app.get("/StatsInfo", async (req, res) => {
  try {
    const totalAmountResult = await HistoryModel.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$Amount" },
        },
      },
    ]);

    const totalAmount =
      totalAmountResult.length > 0 ? totalAmountResult[0].totalAmount : 0;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);

    const todayTotalResult = await HistoryModel.aggregate([
      {
        $match: {
          Date: {
            $gte: startOfToday,
            $lt: endOfToday,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$Amount" },
        },
      },
    ]);

    const todayTotalAmount =
      todayTotalResult.length > 0 ? todayTotalResult[0].totalAmount : 0;
    const totalGeneralUsers = await UserModel.countDocuments({
      status: "General",
    });
    const totalAgentUsers = await UserModel.countDocuments({ status: "Agent" });

    res.json([
      { id: 1, name: "Total Transactions", number: `${totalAmount} $` },
      { id: 2, name: "Daily Transactions", number: `${todayTotalAmount} $` },
      { id: 3, name: "General Customers", number: totalGeneralUsers },
      { id: 4, name: "Agents", number: totalAgentUsers },
    ]);
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ error: "An error occurred while fetching stats" });
  }
});

app.get("/chartOfServices", async (req, res) => {
  const totalSendMoney = await HistoryModel.countDocuments({
    Status: "Send Money",
  });
  const totalCashOut = await HistoryModel.countDocuments({
    Status: "Cash Out",
  });
  const totalCashIn = await HistoryModel.countDocuments({ Status: "Cash In" });
  res.send({
    totalSendMoney: totalSendMoney,
    totalCashOut: totalCashOut,
    totalCashIn: totalCashIn,
  });
});

app.get("/AllTransactions", async (req, res) => {
  const { service } = req.query;
  console.log(service);
  if (service === "All") {
    const result = await HistoryModel.find();
    res.send(result);
  } else {
    const result = await HistoryModel.find({ Service: service });
    res.send(result);
  }
});
app.get("/AllUsers", async (req, res) => {
  const { service } = req.query;
  console.log(service);
  if (service === " ") {
    const result = await UserModel.find();
    res.send(result);
  } else {
    const result = await UserModel.find({ Service: service });
    res.send(result);
  }
});

// server running test
app.get("/", (req, res) => {
  res.send("Payasa server running ...");
});

app.listen(port, () => {
  console.log(`Payasa server listening on port ${port}`);
});
