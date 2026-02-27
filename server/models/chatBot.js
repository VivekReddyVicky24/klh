const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    domain: {
      type: String,
      enum: ["AI","ML", "Cyber"],
      required: true,
    },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("StudyGroup", groupSchema);