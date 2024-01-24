import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import errorHandler from "./middlewares/errorMiddleware.js";
import { PORT } from "./config/config.js";
import userRoute from "./routes/userRoute.js";
const app = express();
// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  cors({
    origin: ["http:localhost:300", "https://darajotech.vercel.app"],
    credentials: true,
  })
);
// Routes
app.use("/api/users", userRoute);
app.get("/", (req, res) => {
  res.send("Home Page...");
});
connectDB();
// error middleware
app.use(errorHandler);
const PORTNumber = PORT || 5000;
app.listen(PORTNumber, (req, res) => {
  console.log(`Server is running at: http://localhost:${PORTNumber}`);
});
