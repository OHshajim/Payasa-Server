const UserModel = require("../Models/User");
const bcrypt = require("bcrypt");

const registration = async (req, res) => {
  try {
    const { number, email, pin } = req.body;
    const user = await UserModel.findOne({ email, number });
    if (user) {
      return res
        .status(409)
        .json({ message: "user Already exist !!!", success: false });
    }
    const NewUser = new UserModel({ number, email, pin });
    NewUser.pin = await bcrypt.hash(pin, 10);
    await NewUser.save();
    res
      .status(201)
      .json({ message: "User successfully created", success: true });
  } catch (error) {
    res.status(500).json({ message: "Internal Server error", success: false });
  }
};


module.exports = { registration}