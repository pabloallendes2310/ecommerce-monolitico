import express from "express";
import authRoutes from "./modules/auth/auth.routes.js";
import itemRoutes from "./modules/item/item.routes.js";
import orderRoutes from "./modules/order/order.routes.js";
import "dotenv/config";
const app = express();
const port = process.env.PORT || 3000;

// CORS: permitir peticiones desde el frontend
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
});

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "backend", version: "1.0.0" });
});

app.use("/auth", authRoutes);
app.use("/items", itemRoutes);
app.use("/order", orderRoutes);

app.listen(port, () => {
  console.log(`Servidor ts corriendo en http://localhost:${port}`);
});
