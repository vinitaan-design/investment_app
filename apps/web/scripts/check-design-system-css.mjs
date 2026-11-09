// Fails if the app's production CSS is missing classes that only the design system
// package uses. Catches a broken `@source` (components would render unstyled).
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../.next/static", import.meta.url).pathname;

function cssFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return cssFiles(path);
    return path.endsWith(".css") ? [path] : [];
  });
}

let css;
try {
  css = cssFiles(root)
    .map((f) => readFileSync(f, "utf8"))
    .join("\n");
} catch {
  console.error(`No build output at ${root}. Run "npm run build" first.`);
  process.exit(1);
}

// Classes used only inside packages/ui (Alert, Button, Input, ProgressBar, GoalCard).
const required = [".bg-status-info", ".h-13", ".border-line-strong", ".type-numeric-hero", ".bg-brand"];
const missing = required.filter((cls) => !css.includes(cls));

if (missing.length > 0) {
  console.error(`Design system classes missing from app CSS: ${missing.join(", ")}`);
  console.error("Check the @source path in apps/web/src/app/globals.css.");
  process.exit(1);
}
console.log(`Design system CSS present (${required.length} checks).`);
