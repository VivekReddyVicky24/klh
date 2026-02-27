const express = require("express");
const router = express.Router();
const groupController = require("../controllers/groupController");
const verifyToken = require("../middleware/authMiddleware");

router.post("/join", verifyToken, groupController.joinOrCreateGroup);
router.get("/", verifyToken, groupController.getGroups);
router.post("/join/:groupId", verifyToken, groupController.joinGroup);
router.get("/:groupId/members", verifyToken, groupController.getGroupMembers);

module.exports = router;