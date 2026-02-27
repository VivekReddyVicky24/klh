const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const verifyToken = require("../middleware/authMiddleware");

router.post("/send", verifyToken, messageController.sendMessage);
router.get("/:groupId", verifyToken, messageController.getMessages);

module.exports = router;