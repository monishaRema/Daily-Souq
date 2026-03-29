import express from "express";
import helmet from "helmet";
import cors from "cors";
import { router } from "./router/index.js";
import { notFound } from "./middleware/notFound.middleware.js";
import { globalErrorHandler } from "./middleware/error.middleware.js";

export const app = express();

// security & parsing
app.use(helmet());
app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
);
app.use(express.json());

// routes
app.use("/api/v1", router);

// not found
app.use(notFound);

// global error handler
app.use(globalErrorHandler);
