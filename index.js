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
    const date = new Date();
    const formattedDate = date.toLocaleDateString("en-US");

    const toUpdate = await UserModel.updateOne({ _id: to._id }, toDocument);
    console.log(fromUpdate, toUpdate);
    const statement = new HistoryModel({
      Service: user.service,
      From: from.number,
      To: to.number,
      Date: formattedDate,
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
    }
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      success: false,
      error: error.message,
    });
  }
});

// Add money
app.post("/addMoney/:number", async (req, res) => {
  const user = req.body;
  const From = req.params;
  const date = new Date();
  const formattedDate = date.toLocaleDateString("en-US");

  const RequestData = await RequestModel({
    From: From.number,
    To: user.number,
    Date: formattedDate,
    Amount: user.amount,
    Status: "Pending",
  });
  await RequestData.save();
  res.status(201).json({
    message: "Request Send successfully",
    success: true,
  });
});

// add money confirmation
app.patch("/RequestConfirmation:id", async (req, res) => {
  const { id } = req.params;
  const date = new Date();
  const formattedDate = date.toLocaleDateString("en-US");
  const dataOfRequest = await RequestModel.findOne({ _id: id });

  const receiverAccountUpdate = {
    $inc: {
      balance: dataOfRequest.Amount,
    },
  };
  const sendingAccountUpdate = {
    $inc: {
      balance: -dataOfRequest.Amount,
    },
  };

  const sendingAccountSave = await UserModel.updateOne(
    { number: dataOfRequest.To },
    sendingAccountUpdate
  );
  const receiverAccountSave = await UserModel.updateOne(
    { number: dataOfRequest.From },
    receiverAccountUpdate
  );

  const statement = new HistoryModel({
    Service: "Add Money",
    From: dataOfRequest.To,
    To: dataOfRequest.From,
    Date: formattedDate,
    Amount: dataOfRequest.Amount,
    Charge: 0,
  });
  const updateDocument = {
    $set: {
      Status: "Confirmed",
    },
  };
  if (sendingAccountSave.modifiedCount && receiverAccountSave.modifiedCount) {
    await statement.save();
    const request = await RequestModel.updateOne({ _id: id }, updateDocument);
    res.send({ message: "Request successfully confirmed !!!" }).status(200);
  } else {
    res.send({ message: "Something Gone Wrong!!!" }).status(500);
  }
});

// RequestDelete money request
app.delete("/RequestDelete:id", async (req, res) => {
  const { id } = req.params;
  const result = await RequestModel.deleteOne({ _id: id });
  if (result.deletedCount) {
    res.status(200).json({
      message: "Request successfully deleted",
      success: true,
    });
  }
});

// Admin
app.get("/StatsInfo", async (req, res) => {
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

  const NumberOfTransaction = await HistoryModel.countDocuments();
  const totalGeneralUsers = await UserModel.countDocuments({
    status: "General",
  });
  const totalAgentUsers = await UserModel.countDocuments({ status: "Agent" });

  res.json([
    { id: 1, name: "Total Transactions", number: NumberOfTransaction },
    { id: 2, name: "Total Transactions Amount", number: totalAmount },
    { id: 3, name: "General Customers", number: totalGeneralUsers },
    { id: 4, name: "Agents", number: totalAgentUsers },
  ]);
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
  if (service === "All") {
    const result = await HistoryModel.find();
    res.send(result);
  } else {
    const result = await HistoryModel.find({ Service: service });
    res.send(result);
  }
});

app.get("/AllUsers", async (req, res) => {
  const { type } = req.query;
  console.log(type);
  if (type === "All") {
    const result = await UserModel.find();
    res.send(result);
  } else {
    const result = await UserModel.find({ status: type });
    res.send(result);
  }
});

app.patch("/UpdateAccount:id", async (req, res) => {
  const { id } = req.params;
  const { type } = req.query;
  let UpdatedDoc = {
    $set: {
      status: type == "General" ? "Agent" : "Admin",
    },
  };
  if (type === "General") {
    UpdatedDoc = {
      $set: {
        status: type == "General" ? "Agent" : "Admin",
      },
      $inc: {
        balance: 20000,
      },
    };
  }

  const result = await UserModel.updateOne({ _id: id }, UpdatedDoc);
  res.send({ message: "Successfully Updated this Account" }).status(200);
});

app.delete("/DeleteClient:id", async (req, res) => {
  const { id } = req.params;
  const result = await UserModel.deleteOne({ _id: id });
  res.send({ message: "Successfully deleted this Account " }).status(200);
});

app.get("/AllRequests", async (req, res) => {
  const { filter } = req.query;
  if (filter === "All") {
    const result = await RequestModel.find();
    res.send(result);
  } else {
    const result = await RequestModel.find({ Status: filter });
    res.send(result);
  }
});
// For Agent

app.get("/AgentRequests:number", async (req, res) => {
  const { number } = req.params;
  const { filter } = req.query;

  if (filter === "All") {
    const result = await RequestModel.find({ To: number });
    res.send(result);
  } else {
    const result = await RequestModel.find({ Status: filter ,To: number });
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
