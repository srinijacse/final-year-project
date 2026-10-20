import dotenv from "dotenv";
import connectDB from "./config/connectDB.js";
import { app } from "./app.js";
import { Server } from "socket.io";
import { seedQuestions } from "./utils/seedAssessmentData.js";

dotenv.config();

const port = process.env.PORT || 8000;

connectDB()
  .then(async () => {
    // Seed initial assessment questions
    await seedQuestions();

    const server = app.listen(port, () => {
      console.log(`🚀 SkillSwap Server listening on port ${port}`);
    });

    const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";

    const io = new Server(server, {
      pingTimeout: 60000,
      cors: {
        origin: corsOrigin,
        credentials: true,
      },
    });

    const onlineUsers = new Map(); // userId -> socketId

    io.on("connection", (socket) => {
      console.log("Socket connected:", socket.id);

      // User joins their personal room and registers as online
      socket.on("setup", (userData) => {
        if (!userData || !userData._id) return;
        socket.join(userData._id);
        onlineUsers.set(userData._id, socket.id);
        socket.emit("connected");
        // Broadcast list of online user IDs
        io.emit("get-online-users", Array.from(onlineUsers.keys()));
        console.log(`User ${userData.name || userData.username} (${userData._id}) is online.`);
      });

      // Join a chat room
      socket.on("join chat", (room) => {
        socket.join(room);
        console.log(`Socket ${socket.id} joined chat room: ${room}`);
      });

      // Typing indicators
      socket.on("typing", ({ chat, senderName }) => {
        if (!chat) return;
        socket.in(chat).emit("typing", { chat, senderName });
      });

      socket.on("stop typing", ({ chat }) => {
        if (!chat) return;
        socket.in(chat).emit("stop typing", { chat });
      });

      // New Message event
      socket.on("new message", (newMessage) => {
        const chat = newMessage.chatId;
        if (!chat || !chat.users) return console.log("Chat or chat.users not defined");

        chat.users.forEach((user) => {
          const userId = typeof user === "object" ? user._id : user;
          if (userId.toString() === newMessage.sender._id.toString()) return;

          io.to(userId.toString()).emit("message recieved", newMessage);
          io.to(userId.toString()).emit("message received", newMessage);
        });
      });

      // Real-time notifications
      socket.on("send notification", (notification) => {
        if (notification && notification.recipient) {
          io.to(notification.recipient.toString()).emit("notification received", notification);
        }
      });

      // Disconnection handling
      socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id);
        let disconnectedUserId = null;
        for (const [userId, socketId] of onlineUsers.entries()) {
          if (socketId === socket.id) {
            disconnectedUserId = userId;
            onlineUsers.delete(userId);
            break;
          }
        }
        if (disconnectedUserId) {
          io.emit("get-online-users", Array.from(onlineUsers.keys()));
        }
      });
    });
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });
