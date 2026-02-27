const Message = require("../models/messageModel");


// ================= SEND MESSAGE =================
exports.sendMessage = async (req, res) => {
  try {
    const { groupId, content } = req.body;
    const userId = req.user.id;

    const message = await Message.create({
      group: groupId,
      sender: userId,
      content,
    });

    res.status(201).json(message);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ================= GET MESSAGES =================
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ group: req.params.groupId })
      .populate("sender", "name")
      .sort({ createdAt: 1 });

    res.json(messages);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};