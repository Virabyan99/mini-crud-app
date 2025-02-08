import { Hono } from "hono";

const dbAPI = new Hono();

// SQL query to create the 'items' table if it doesn't exist
const createTableSQL = `
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    count INTEGER NOT NULL
  );
`;

// Route to initialize the database (GET /api/db/init)
dbAPI.get("/init", async (c) => {
  try {
    const db = c.env.DB; // Retrieve DB from request context
    await db.prepare(createTableSQL).run(); // Create table if not exists
    return c.json({ message: "Database initialized successfully!" });
  } catch (error) {
    return c.json({ error: error.toString() }, 500);
  }
});

export default dbAPI;
