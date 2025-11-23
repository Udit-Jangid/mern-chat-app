const express = require("express");
const {
  userRegister,
  userLogin,
  allUsers,
} = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.route("/").post(userRegister).get(protect, allUsers);
router.route("/login").post(userLogin);

module.exports = router;
