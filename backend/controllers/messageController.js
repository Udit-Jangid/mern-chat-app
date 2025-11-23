const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const sendMessage = async (req, res, next) => {
  const { content, chatId } = req.body;
  try {
    if (!content || !chatId) {
      res.status(400);
      throw new Error("Invalid Chat");
    }
    let message = await Message.create({
      sender: req.user._id,
      content,
      chat: chatId,
    });
    message = await message.populate("sender", "name email pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });
    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });
    res.status(200).send(message);
  } catch (error) {
    next(error);
  }
};

const allMessages = async (req, res, next) => {
  const { params } = req;
  const { chatId } = params;
  try {
    if (!chatId) {
      res.status(400);
      throw new Error("Invalid Chat");
    }
    const messages = await Message.find({ chat: chatId })
      .populate("sender", "-password")
      .populate("chat");
    res.status(200).send(messages);
  } catch (error) {
    next(error);
  }
};

module.exports = { sendMessage, allMessages };
