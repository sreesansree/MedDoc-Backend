import express from "express";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./infrastructure/database/mongodb/connection.js";
import userRoutes from "./infrastructure/api/routes/userRoutes.js";
import adminRoutes from "./infrastructure/api/routes/adminRoutes.js";
import { errorHandler, notFound } from "./middileware/middileware.js";

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
// app.use(cors());

app.use(express.json({ extended: true, limit: "500mb" }));
app.use(express.urlencoded({ extended: true, limit: "500mb" }));
app.use(cookieParser());
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

/* app.use("/", (req, res) => {
  res.status(200).send({
    message: "Server Running",
  });
}); */

// Error-handling middleware
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`server is Runnig on ${PORT}`);
});
