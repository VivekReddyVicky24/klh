const StudyGroup = require("../models/groupModel");
const User = require("../models/userModel");


// ================= CREATE GROUP =================
exports.joinOrCreateGroup = async (req, res) => {
  try {
    const { domain, level } = req.body;
    const userId = req.user.id;

    // 1️⃣ Find existing group
    let group = await StudyGroup.findOne({ domain, level });

    // 2️⃣ If not exists → create
    if (!group) {
      group = await StudyGroup.create({
        domain,
        level,
        members: []
      });
    }

    // 3️⃣ Prevent duplicate join
    if (group.members.some(member => member.toString() === userId)) {
      return res.status(400).json({ message: "Already joined this group" });
    }

    // 4️⃣ Add user to group
    group.members.push(userId);
    await group.save();

    // 5️⃣ Update user skills (IMPORTANT FIX)
    await User.findByIdAndUpdate(
      userId,
      {
        $addToSet: {
          skills: { domain, level }
        }
      }
    );

    res.json({
      message: "Joined successfully",
      group
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================= GET GROUPS (WITH FILTER) =================
exports.getGroups = async (req, res) => {
  try {
    const { domain, level } = req.query;

    const filter = {};
    if (domain) filter.domain = domain;
    if (level) filter.level = level;

    const groups = await StudyGroup.find(filter);

    res.json(groups);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ================= JOIN GROUP =================
exports.joinGroup = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const userId = req.user.id; // from verifyToken middleware

    const group = await StudyGroup.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Prevent duplicate join
    if (group.members.includes(userId)) {
      return res.status(400).json({ message: "Already joined this group" });
    }

    group.members.push(userId);
    await group.save();

    res.json({ message: "Joined group successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ================= GET GROUP MEMBERS =================
exports.getGroupMembers = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.groupId)
      .populate("members", "name email");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.json(group.members);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};