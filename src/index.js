import express from "express";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./infrastructure/database/mongodb/connection.js";
dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000

app.use(morgan("dev"));
app.use(cors());

app.use("/", (req, res) => {
  res.send("Server Running success");
});

app.listen(PORT, () => {
  console.log(`server is Runnig on ${PORT}`);
});
