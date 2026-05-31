import express from "express";
import { rateLimit } from "./middleware/rateLimit";
import { errorHandler } from "./middleware/errors";
import { healthRoutes } from "./routes/health";
import { indexRoutes } from "./routes/indices";
import { comfortRoutes } from "./routes/comfort";
import { batchRoutes } from "./routes/batch";
import { metaRoutes } from "./routes/meta";
import { docsRoutes } from "./docs/scalar";

export function buildApp(): express.Express {
  const app = express();
  app.set("trust proxy", true);
  app.use(express.json({ limit: "1mb" }));
  app.use(rateLimit());

  app.get("/", (_req, res) => res.redirect("/docs"));
  app.use(docsRoutes());
  app.use(healthRoutes());
  app.use(indexRoutes());
  app.use(comfortRoutes());
  app.use(batchRoutes());
  app.use(metaRoutes());

  app.use((_req, res) => res.status(404).json({ error: "Not found" }));

  app.use(errorHandler); // MUST be last
  return app;
}
