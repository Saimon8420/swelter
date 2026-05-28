import express from "express";
import { rateLimit } from "./middleware/rateLimit";
import { errorHandler } from "./middleware/errors";
import { healthRoutes } from "./routes/health";
import { indexRoutes } from "./routes/indices";

export function buildApp(): express.Express {
  const app = express();
  app.use(express.json({ limit: "1mb" }));
  app.use(rateLimit());

  app.use(healthRoutes());
  app.use(indexRoutes());

  app.use(errorHandler); // MUST be last
  return app;
}
