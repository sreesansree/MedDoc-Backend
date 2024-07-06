import express from "express";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = 8080;

app.use(morgan("dev"));
app.use(cors());
app.use("/", (req, res) => {
  res.send("Server Running success");
});

app.listen(PORT, () => {
  console.log(`server is Runnig on ${PORT}`);
});
