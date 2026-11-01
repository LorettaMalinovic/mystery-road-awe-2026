import express from "express";
import cors from "cors";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "public", "data");

const PORT = Number(process.env.PORT) || 3001;
const DEFAULT_DELAY_MS = Number(process.env.API_DELAY_MS) || 0; // delay for ALL endpoints
const MAX_DELAY_MS = 10000;

const RESOURCES = {
  case: "case.json",
  evidence: "evidence.json",
  people: "people.json",
  locations: "locations.json",
  timeline: "timeline.json",
};

const app = express();

// CORS: the page comes from http://localhost:5173 (Vite), the API is on :3001.
// Different port = different origin, so the browser blocks the response unless we allow it.
app.use(cors({ origin: ["http://localhost:5173", "http://127.0.0.1:5173"] }));

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

for (const [name, file] of Object.entries(RESOURCES)) {
  app.get(`/api/${name}`, async (req, res) => {
    // ?delay=2000 -> wait 2 seconds (per request). Without it: API_DELAY_MS env var.
    const requested = Number(req.query.delay);
    const delay = Number.isFinite(requested)
      ? Math.min(Math.max(requested, 0), MAX_DELAY_MS)
      : DEFAULT_DELAY_MS;
    if (delay > 0) await wait(delay);

    // ?fail=1 -> simulated server error
    if (req.query.fail === "1") {
      res.status(500).json({ error: `Simulated failure for /api/${name}` });
      return;
    }

    try {
      const text = await readFile(path.join(DATA_DIR, file), "utf8");
      res.type("application/json").send(text); // same bytes as the static file
    } catch {
      res.status(500).json({ error: `Could not read ${file}` });
    }
  });
}

app.listen(PORT, () => {
  console.log(`ReMotion dev API on http://localhost:${PORT}  (dev only, not deployed)`);
});
