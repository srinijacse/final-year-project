import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Importing routes
import userRouter from "./routes/user.routes.js";
import authRouter from "./routes/auth.routes.js";
import chatRouter from "./routes/chat.routes.js";
import messageRouter from "./routes/message.routes.js";
import requestRouter from "./routes/request.routes.js";
import ratingRouter from "./routes/rating.routes.js";
import sessionRouter from "./routes/session.routes.js";
import assessmentRouter from "./routes/assessment.routes.js";
import portfolioRouter from "./routes/portfolio.routes.js";
import notificationRouter from "./routes/notification.routes.js";

// Using routes
app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/chat", chatRouter);
app.use("/message", messageRouter);
app.use("/request", requestRouter);
app.use("/rating", ratingRouter);
app.use("/session", sessionRouter);
app.use("/sessions", sessionRouter);
app.use("/assessment", assessmentRouter);
app.use("/portfolio", portfolioRouter);
app.use("/notification", notificationRouter);
app.use("/notifications", notificationRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date() });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Express Error Handler:", err);
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return res.status(statusCode).json({
    statusCode,
    data: null,
    message,
    success: false,
    errors: err.errors || [],
  });
});

export { app };
