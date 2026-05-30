import { build } from "esbuild";

await build({
  entryPoints: ["src/vercel.ts"],
  bundle: true,
  platform: "node",
  target: "node20",
  format: "cjs",
  outfile: "api/index.js",
});
console.log("Bundled → api/index.js");
