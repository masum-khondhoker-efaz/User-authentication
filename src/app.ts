import  dotenv  from 'dotenv';
import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import rateLimit from 'express-rate-limit';
import cookieParser from "cookie-parser";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import router from "./app/routes";
import config from './config';
const app: Application = express();
dotenv.config();


export const corsOptions = {
  origin: [
    'http://localhost:3001',
    'http://localhost:3000',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

// Middleware setup
app.use(cors(corsOptions));
app.use(cookieParser());

app.use(rateLimit({
  windowMs: Number(config.request_time_limit),
  max: Number(config.request_number_of_limit),
  message: {
    success: false,
    message: "Too many requests, please try again later.",
    error: {
      message: "Too many requests, please try again later.",
    },
  },
}));

//parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.send({
    Message: "The server is running. . .",
  });
});

app.use("/api/v1", router);

app.use(globalErrorHandler);

app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "API NOT FOUND!",
    error: {
      path: req.originalUrl,
      message: "Your requested path is not found!",
    },
  });
});

export default app;
