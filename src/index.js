import express from "express";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoute.js";
import doctorRoutes from "./routes/doctorRoute.js";
import setupSocket from "./socket/socket.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoute.js";
// import path from "path";

// import { fileURLToPath } from "url";

// Manually define __dirname
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(morgan("dev"));

// Configure CORS
const corsOptions = {
  origin: "http://localhost:5173", // Allow only this origin
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  credentials: true, // Allow cookies to be sent with requests
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(express.json({ extended: true, limit: "500mb" }));
app.use(express.urlencoded({ extended: true, limit: "500mb" }));
app.use(cookieParser());

// Serve static files from the uploads folder
app.use("/uploads", express.static("uploads"));
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/messages", messageRoutes);

const server = app.listen(PORT, () => {
  
  console.log(`server is Runnig on ${PORT}`);
});

setupSocket(server);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || " Internal Server Error";
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});
