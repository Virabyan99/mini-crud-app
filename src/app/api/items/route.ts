import { Hono } from 'hono'

const itemsAPI = new Hono()

// Authentication Middleware to Protect Routes
// itemsAPI.use("*", async (c, next) => {
//   const authHeader = c.req.header("Authorization");
//   if (!authHeader || authHeader !== "Bearer my-secret-token") {
//     return c.json({ error: "Unauthorized: Invalid or missing token." }, 401);
//   }
//   return await next();
// });

// 📌 Create Item (POST /api/items)
itemsAPI.post('/', async (c) => {
  try {
    const db = c.env.DB as D1Database; // Get DB from context
    const newItem = await c.req.json(); // Get item data from request body

    if (!newItem.name || !newItem.price || !newItem.count) {
      return c.json({ error: 'Missing required fields: name, price, count' }, 400);
    }

    const insertSQL = `
      INSERT INTO items (name, price, count)
      VALUES (?, ?, ?)
    `;

    const result = await db
      .prepare(insertSQL)
      .bind(newItem.name, newItem.price, newItem.count)
      .run();

    return c.json({
      message: 'Item created successfully!',
      id: result.meta.last_insert_rowid,
    });
  } catch (error) {
    return c.json({ error: error.toString() }, 500);
  }
})

// 📌 Retrieve Items (GET /api/items)
itemsAPI.get("/", async (c) => {
  try {
    const db = c.env.DB as D1Database;
    const result = await db.prepare('SELECT * FROM items').all();
    return c.json({ items: result.results });
  } catch (error) {
    return c.json({ error: error.toString() }, 500);
  }
});

// 📌 Retrieve Item by ID (GET /api/items/:id)
itemsAPI.get("/:id", async (c) => {
  try {
    const db = c.env.DB as D1Database;
    const itemId = c.req.param("id");

    // Fetch the item by ID
    const result = await db.prepare("SELECT * FROM items WHERE id = ?").bind(itemId).first();

    if (!result) {
      return c.json({ error: "No item found with this ID." }, 404);
    }

    return c.json({ item: result });
  } catch (error) {
    return c.json({ error: error.toString() }, 500);
  }
});

// 📌 Update Item (PUT /api/items/:id)
itemsAPI.put("/:id", async (c) => {
  try {
    const db = c.env.DB as D1Database;
    const itemId = c.req.param("id");
    const updatedData = await c.req.json();

    // Ensure at least one field is provided for update
    if (Object.keys(updatedData).length === 0) {
      return c.json({ error: "No update data provided." }, 400);
    }

    let setClauses = [];
    let values = [];
    for (const key in updatedData) {
      setClauses.push(`${key} = ?`);
      values.push(updatedData[key]);
    }

    values.push(itemId); // Add ID for `WHERE id = ?`

    const setClause = setClauses.join(", ");
    const updateSQL = `UPDATE items SET ${setClause} WHERE id = ?`;

    const result = await db.prepare(updateSQL).bind(...values).run();

    if (result.success && result.meta?.changes > 0) {
      return c.json({ message: "Item updated successfully!" });
    } else {
      return c.json({ error: "No item found with the provided ID." }, 404);
    }
  } catch (error) {
    return c.json({ error: error.toString() }, 500);
  }
});

// 📌 Delete Item (DELETE /api/items/:id)
itemsAPI.delete('/:id', async (c) => {
  try {
    const db = c.env.DB as D1Database;
    const itemId = c.req.param('id');

    const deleteSQL = `DELETE FROM items WHERE id = ?`;
    const result = await db.prepare(deleteSQL).bind(itemId).run();

    if (result.success && result.meta?.changes > 0) {
      return c.json({ message: 'Item deleted successfully!' });
    } else {
      return c.json({ error: 'No item found with the provided ID.' }, 404);
    }
  } catch (error) {
    return c.json({ error: error.toString() }, 500);
  }
});

export default itemsAPI;
