const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserModel = require("../Models/User");

const registration = async (req, res) => {
  try {
    const { number, email, pin } = req.body;
    const userEmail = await UserModel.findOne({ email });
    const userNumber = await UserModel.findOne({ number });
    const status = "General",
      balance = 50;
    if (userEmail || userNumber) {
      console.log("already access");
      return res
        .status(409)
        .json({ message: "user Already exist !!!", success: false });
    }
    const date = new Date();
    const formattedDate = date.toLocaleDateString("en-US");

    const NewUser = new UserModel({
      number,
      email,
      pin,
      status,
      date: formattedDate,
      balance,
    });
    NewUser.pin = await bcrypt.hash(pin, 10);

    const jwtToken = jwt.sign(
      {
        email: email,
        number: number,
        _id: NewUser._id,
      },
      process.env.SECRET_KEY,
      { expiresIn: "24h" }
    );

    await NewUser.save();
    res.status(201).json({
      message: "User successfully created",
      success: true,
      access_token: jwtToken,
      userID: NewUser._id,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server error", success: false });
  }
};

const Login = async (req, res) => {
  try {
    const { number, pin } = req.body;
    const user = await UserModel.findOne({ number });
    if (!user) {
      return res.status(403).json({
        message: "User undefine ,Please register now",
        success: false,
      });
    }
    const pinValidate = await bcrypt.compare(pin, user.pin);
    if (!pinValidate) {
      return res.status(403).json({
        message: "Please remember your account pin , Try again !!!",
        success: false,
      });
    }
    const jwtToken = jwt.sign(
      {
        email: user.email,
        number: user.number,
        _id: user._id,
      },
      process.env.SECRET_KEY,
      { expiresIn: "20min" }
    );
    res.status(200).json({
      message: "User successfully Login",
      success: true,
      access_token: jwtToken,
      userID: user._id,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server error", success: false });
  }
};

module.exports = { registration, Login };
