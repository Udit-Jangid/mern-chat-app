const express = require("express");
const dotenv = require("dotenv");
const { chats } = require("./data/data");
const connectDB = require("./config/db");
const colors = require("colors");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");
const path = require("path");

const PORT = process.env.PORT || 5000;
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://mern-chat-app-2x6j.onrender.com",
];

dotenv.config();
connectDB();
const app = express();

app.use(express.json()); // to accept JSON Data

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

//------------ Deployment --------------

const __dirname1 = path.resolve();
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/frontend/dist")));
  app.get(/.*/, (req, res) => {
    res.sendFile(path.resolve(__dirname1, "frontend", "dist", "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("API is Running");
  });
}

//------------ Deployment --------------

// error and not found request handler

app.use(notFound);
app.use(errorHandler);

const server = app.listen(
  PORT,
  console.log(`Server Started on PORT ${PORT}`.yellow.bold)
);

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        var msg =
          "The CORS policy for this site does not " +
          "allow access from the specified Origin : " +
          `${origin}`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  },
});

io.on("connection", (socket) => {
  console.log("connected to socket.io");
  // just user is connected to socket or not
  socket.on("setup", (userData) => {
    console.log("userid", userData.name);
    socket.join(userData._id);
    socket.emit("connected");
  });

  // join Chat Room
  socket.on("join chatroom", (chatId) => {
    socket.join(chatId);
    console.log("user has joined room : " + chatId);
    socket.emit("joined chatroom");
  });

  // new message
  socket.on("new message", (newMsgRecieved) => {
    const chat = newMsgRecieved.chat;
    const users = chat.users;
    if (!users) return console.log("User is not defined.");
    users.forEach((user) => {
      if (user._id === newMsgRecieved.sender._id) return;
      socket.in(user._id).emit("message recieved", newMsgRecieved);
    });
  });

  // typing
  socket.on("typing", (chatId) => {
    socket.in(chatId).emit("typing");
  });
  socket.on("stop typing", (chatId) => {
    socket.in(chatId).emit("stop typing");
  });
  // close
  socket.off("setup", (userData) => {
    console.log("This user is disconnected : ", userData.name);
    socket.leave(userData._id);
  });
});
