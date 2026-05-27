import { Router } from "express";

export function healthRoutes(): Router {
  const r = Router();
  r.get("/health", (_req, res) => res.json({ ok: true, uptime: process.uptime() }));
  return r;
}
