import express from "express";
import { rateLimit } from "./middleware/rateLimit";
import { errorHandler } from "./middleware/errors";
import { healthRoutes } from "./routes/health";

export function buildApp(): express.Express {
  const app = express();
  app.use(express.json({ limit: "1mb" }));
  app.use(rateLimit());

  app.use(healthRoutes());

  app.use(errorHandler); // MUST be last
  return app;
}
