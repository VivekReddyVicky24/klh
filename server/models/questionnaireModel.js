const mongoose = require("mongoose");

const questionnaireSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    answers: [
      {
        questionId: String,
        score: Number,
      },
    ],
    predictedDomain: {
      type: String
    },
    predictedClass: {
      type: Number
    },
    confidence: {
      type: Number
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Questionnaire", questionnaireSchema);