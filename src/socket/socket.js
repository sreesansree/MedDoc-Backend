import { Server } from "socket.io";

const setupSocket = (server) => {
  const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Connected to socket", socket.id);

    socket.on("setup", (userData) => {
      socket.join(userData._id);
      socket.emit("chat connected");
    });

    socket.on("join-chat", (roomId) => {
      socket.join(roomId);
      io.to(roomId).emit("chat-connected");
    });

    socket.on("send_message", (message) => {
      io.to(message.receiverId).emit("receive_message", message);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  return io;
};

export default setupSocket;
