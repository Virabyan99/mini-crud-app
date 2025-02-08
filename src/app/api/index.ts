import { Hono } from "hono";
import itemsAPI from "./items/route"; // Import items API routes
import dbAPI from "./db/route"; // Import DB initialization routes

const app = new Hono();

// Attach `/api/items` and `/api/db` routes
app.route("/items", itemsAPI); // Attach `/api/items`
app.route("/db", dbAPI); // Attach `/api/db`

export default app;
