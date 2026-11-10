// Fails the build check if any signed-in route was prerendered as fully static.
// Signed-in pages must render personal data per request; a fully static route would mean
// its content was fixed at build time (or cached) and could be served to anyone.
import { readFileSync } from "node:fs";

const manifestPath = new URL("../.next/prerender-manifest.json", import.meta.url);
let manifest;
try {
  manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
} catch {
  console.error('No build output found. Run "npm run build" first.');
  process.exit(1);
}

const privatePrefixes = ["/app", "/advisor", "/onboarding"];
const isPrivate = (route) => privatePrefixes.some((p) => route === p || route.startsWith(`${p}/`));

const offenders = Object.entries(manifest.routes)
  .filter(([route, info]) => isPrivate(route) && info.renderingMode !== "PARTIALLY_STATIC")
  .map(([route, info]) => `${route} (${info.renderingMode ?? "static"})`);

if (offenders.length > 0) {
  console.error(`Signed-in routes must not be fully static:\n  ${offenders.join("\n  ")}`);
  process.exit(1);
}
const checked = Object.keys(manifest.routes).filter(isPrivate).length;
console.log(`Private routes render per request (${checked} checked).`);
