const Chat = require("../models/chatModel");
const User = require("../models/userModel");

const accessChat = async (req, res, next) => {
  const { userId } = req.body;
  if (!userId) {
    res.status(400);
    throw new Error("userid is required");
  }
  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name email pic",
  });
  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    try {
      const chatCreated = await Chat.create({
        chatName: `${req.user._id}--${userId}`,
        isGroupChat: false,
        users: [req.user._id, userId],
      });
      const fullChat = await Chat.findOne({ _id: chatCreated._id }).populate(
        "users",
        "-password"
      );
      res.status(200).send(fullChat);
    } catch (error) {
      next(error);
    }
  }
};

const fetchChats = async (req, res, next) => {
  try {
    // console.log("User ID :::: ", req.user._id);

    await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({
        updatedAt: -1,
      })
      .then(async (result) => {
        const resultFormat = await User.populate(result, {
          path: "latestMessage.sender",
          select: "name email pic",
        });
        res.status(200).send(resultFormat);
      });
  } catch (error) {
    next(error);
  }
};

const createGroupChat = async (req, res, next) => {
  const { name, users } = req.body;
  try {
    if (!name || !users) {
      res.status(400);
      throw new Error("Please fill all required fields.");
    }
    if (users.length < 2) {
      res.status(400);
      throw new Error("More than 2 users are required to form a group chat.");
    }

    const isGroupExist = await Chat.find({
      chatName: { $regex: name, $options: "i" },
    });
    if (isGroupExist.length) {
      res.status(400);
      throw new Error("This User Group Name already exist.");
    } else {
      const chatGroupCreated = await Chat.create({
        chatName: name,
        groupAdmin: req.user._id,
        isGroupChat: true,
        users: [...users, req.user._id],
      });
      const fullGroupChat = await Chat.findOne({
        _id: chatGroupCreated._id,
      })
        .populate("users", "-password")
        .populate("groupAdmin", "-password");
      res.status(200).send(fullGroupChat);
    }
  } catch (error) {
    next(error);
  }
};

const renameGroupChat = async (req, res, next) => {
  const { chatId, name } = req.body;
  try {
    if (!chatId || !name) {
      res.status(400);
      throw new Error("Please fill all required fields.");
    }
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { chatName: name },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    res.status(200).send(updatedChat);
  } catch (error) {
    next(error);
  }
};

const addToGroup = async (req, res, next) => {
  const { chatId, userId } = req.body;
  try {
    if (!chatId || !userId) {
      res.status(400);
      throw new Error("Please fill all required fields.");
    }
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { $push: { users: userId } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    res.status(200).send(updatedChat);
  } catch (error) {
    next(error);
  }
};

const removeFromGroup = async (req, res, next) => {
  const { chatId, userId } = req.body;
  try {
    if (!chatId || !userId) {
      res.status(400);
      throw new Error("Please fill all required fields.");
    }
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { $pull: { users: userId } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    res.status(200).send(updatedChat);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroupChat,
  addToGroup,
  removeFromGroup,
};
