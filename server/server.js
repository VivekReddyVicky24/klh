const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

// ================= SOCKET.IO SETUP =================
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// ================= SOCKET LOGIC =================
const Message = require("./models/messageModel");

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  socket.on("join_room", (groupId) => {
    socket.join(groupId);
  });

  socket.on("send_message", async (data) => {
    try {
      const { groupId, senderId, content } = data;

      const newMessage = await Message.create({
        group: groupId,
        sender: senderId,
        content,
      });

      io.to(groupId).emit("receive_message", newMessage);

    } catch (error) {
      console.error(error.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());

// ================= DATABASE CONNECTION =================
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
}

connectDB();

// ================= IMPORT ROUTES =================
const userRoutes = require("./routes/userRoutes");
const groupRoutes = require("./routes/groupRoutes");
const messageRoutes = require("./routes/messageRoutes");
const questionnaireRoutes = require("./routes/questionnaireRoutes");

// ================= USE ROUTES =================
app.use("/api/users", userRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/questionnaire", questionnaireRoutes);

// ================= ROOT ROUTE =================
app.get("/", (req, res) => {
  res.json({ message: "🚀 Server Running Successfully" });
});

// ================= START SERVER =================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});