const express = require("express");
const router = express.Router();
const questionnaireController = require("../controllers/questionnaireController");
const verifyToken = require("../middleware/authMiddleware");

router.post("/submit", verifyToken, questionnaireController.submitQuestionnaire);
router.get("/my", verifyToken, questionnaireController.getUserQuestionnaire);

module.exports = router;