import { Router } from "express";
import { openapiSpec } from "./openapi";

const DOCS_HTML = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Swelter API Reference</title>
    <style>
      .light-mode {
        --scalar-background-1: #ffffff;
        --scalar-background-2: #f7f7f7;
        --scalar-background-3: #eeeeee;
      }
      body { margin: 0; }
    </style>
  </head>
  <body>
    <script id="api-reference" data-configuration='{"url":"/openapi.json","theme":"default"}'></script>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
  </body>
</html>`;

export function docsRoutes(): Router {
  const r = Router();
  r.get("/openapi.json", (_req, res) => res.json(openapiSpec));
  r.get("/docs", (_req, res) => res.type("html").send(DOCS_HTML));
  return r;
}
