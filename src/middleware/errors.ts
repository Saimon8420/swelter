import type { Request, Response, NextFunction } from "express";

export class HttpError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

// Last-mounted handler. Any thrown error becomes a clean 400 (or its own status).
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, details: err.details });
  }
  const message = err instanceof Error ? err.message : "Invalid request";
  return res.status(400).json({ error: message });
}
