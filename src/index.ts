import { Hono } from "hono";
import apiRoutes from "./app/api"; // Import API routes
import { cors } from "hono/cors";

const app = new Hono();

app.use(cors({ origin: '*' })); 

// Root route
app.get('/', (c) => c.text('Hello, Items API!')); // Basic "Hello" message

// ==========================
// Logging Middleware
// ==========================
app.use('*', async (c, next) => {
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] ${c.req.method} ${c.req.url}`);
  const response = await next();
  const duration = Date.now() - startTime;
  console.log(`[${new Date().toISOString()}] Completed in ${duration}ms`);
  return response;
});

// ==========================
// Error Handling Middleware
// ==========================
app.use('*', async (c, next) => {
  try {
    return await next();
  } catch (error) {
    console.error('Error caught in middleware:', error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

// ==========================
// Attach API Routes
// ==========================
app.route("/api", apiRoutes); // Attach all API routes under `/api`

export default {
  fetch: app.fetch, // Ensures all routes are registered
};
