import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import kpiRouter from "./routes/kpi.route";
import portRouter from "./routes/port.route";
import authRoutes from "./routes/auth.route";
import { errorHandler } from "./middlewares/ErrorHandler";
import rateLimit from "express-rate-limit";
import s3FilesRouter from "./routes/s3.route";
dotenv.config();

const app = express();
app.set("trust proxy", 1);
app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

const CLIENT_URL = process.env.CLIENT_URL?.split(" ") || [];

app.use(
  cors({
    origin: CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  }),
);

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 250,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again after 10 minutes",
});

app.use(limiter);

app.use("/api/auth", authRoutes);
app.use("/api/port", portRouter);
app.use("/api/kpi", kpiRouter);
app.use("/api/s3", s3FilesRouter);

app.use(errorHandler);

export default app;
