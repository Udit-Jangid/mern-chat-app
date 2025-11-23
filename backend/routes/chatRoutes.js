const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroupChat,
  addToGroup,
  removeFromGroup,
} = require("../controllers/chatController");

const router = express.Router();

router.route("/").post(protect, accessChat);
router.route("/").get(protect, fetchChats);
router.route("/group").post(protect, createGroupChat);
router.route("/renameGroup").put(protect, renameGroupChat);
router.route("/addToGroup").put(protect, addToGroup);
router.route("/removeFromGroup").put(protect, removeFromGroup);

module.exports = router;
