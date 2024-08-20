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

  let activeUsers = [];

  io.on("connection", (socket) => {
    console.log("Connected to socket", socket.id);

    /*  socket.on("setup", (userData) => {
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
    }); */

    /* add new user */
    socket.on("new-user-add", (newUserId) => {
      // if user is not added previously
      console.log(newUserId, "New User Id");
      if (!activeUsers.some((user) => user.userId === newUserId)) {
        activeUsers.push({
          userId: newUserId,
          socketId: socket.id,
        });
      }
      console.log("Connected Users ==> ", activeUsers);
      io.emit("get-users", activeUsers);
    });

    /* Send-messages */
    socket.on("send-message", (data) => {
      const { receiverId } = data;
      const user = activeUsers.find((user) => user.userId === receiverId);
      console.log("Sending from Socket to : ", receiverId);
      console.log("Data : ", data);
      if (user) {
        io.to(user.socketId).emit("receive-message", data);
      }
    });

    socket.on("disconnect", () => {
      activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
      console.log(
        "Active user Disconnected and Remaining users ==>  ",
        activeUsers
      );
      io.emit("get-users", activeUsers);
    });
  });

  return io;
};

export default setupSocket;
