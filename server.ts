import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import helmet from "helmet";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database("searches.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS searches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    destination TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Security and Cross-Origin
  app.use(helmet({
    contentSecurityPolicy: false, // Vite handles this in dev, and we want flexibility for external APIs
    crossOriginEmbedderPolicy: false,
  }));
  app.use(cors());
  app.use(express.json());

  // API Routes
  app.post("/api/log-search", (req, res) => {
    const { destination } = req.body;
    if (!destination) {
      return res.status(400).json({ error: "Destination is required" });
    }

    const normalizedDestination = destination.trim();

    try {
      const stmt = db.prepare("INSERT INTO searches (destination) VALUES (?)");
      stmt.run(normalizedDestination);
      res.json({ success: true });
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Failed to log search" });
    }
  });

  app.get("/api/trending", (req, res) => {
    try {
      // Get top 4 searches in the last 30 days, grouping by trimmed/lowercased destination
      const stmt = db.prepare(`
        SELECT destination, COUNT(*) as count 
        FROM searches 
        WHERE timestamp > datetime('now', '-30 days')
        GROUP BY LOWER(TRIM(destination))
        ORDER BY count DESC 
        LIMIT 4
      `);
      const trending = stmt.all();
      res.json(trending);
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Failed to fetch trending" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
