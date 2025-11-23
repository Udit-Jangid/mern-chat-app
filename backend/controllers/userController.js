const generateToken = require("../config/generateToken");
const User = require("../models/userModel");

const userRegister = async (req, res, next) => {
  const { name, email, password, pic } = req.body;
  try {
    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Please enter all fields");
    }

    const userExist = await User.findOne({ email });

    if (userExist) {
      res.status(400);
      throw new Error("User already exits");
    }

    const user = await User.create({ name, email, password, pic });

    if (user) {
      const token = generateToken(user._id);
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        pic: user.pic,
        token,
      });
    } else {
      res.status(400);
      throw new Error("Failed to create user");
    }
  } catch (error) {
    next(error);
  }
};

const userLogin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      res.status(400);
      throw new Error("Please enter all fields");
    }

    const userExist = await User.findOne({ email });

    if (userExist && (await userExist.matchPassword(password))) {
      const token = generateToken(userExist._id);
      res.cookie("verify_token", token);
      res.status(200).json({
        _id: userExist._id,
        name: userExist.name,
        email: userExist.email,
        pic: userExist.pic,
        token,
      });
    } else {
      res.status(401);
      throw new Error("Invalid email or password");
    }
  } catch (error) {
    next(error);
  }
};

// /api/user?search="name"
const allUsers = async (req, res, next) => {
  const { search } = req.query;
  const keyword = search
    ? {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  try {
    const users = await User.find(keyword).find({
      _id: { $ne: req.user._id },
    });
    if (users) {
      res.status(200).json(
        users.map((u) => {
          return {
            _id: u._id,
            name: u.name,
            email: u.email,
          };
        })
      );
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { userRegister, userLogin, allUsers };
