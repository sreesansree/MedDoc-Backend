import express from "express";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./infrastructure/database/mongodb/connection.js";
import userRoutes from "./infrastructure/api/routes/userRoutes.js";

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(morgan("dev"));

// Configure CORS
const corsOptions = {
  origin: "*", // Allow only this origin
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Allow cookies to be sent with requests
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
// app.use(cors());

app.use(express.json());

app.use("/api/users", userRoutes);

/* app.use("/", (req, res) => {
  res.status(200).send({
    message: "Server Running",
  });
}); */

// Error-handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({ message });
});

app.listen(PORT, () => {
  console.log(`server is Runnig on ${PORT}`);
});
