import express from "express";
import authRoutes from "./modules/auth/auth.routes.js";
import itemRoutes from "./modules/item/item.routes.js";
import orderRoutes from "./modules/order/order.routes.js";
import client from "prom-client";
import "dotenv/config";
const app = express();
const port = process.env.PORT || 3000;

const register = new client.Registry();
register.setDefaultLabels({ app: "ecommerce-backend" });
client.collectDefaultMetrics({ register });

const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total de peticiones HTTP recibidas por el backend.",
  labelNames: ["method", "route", "status_code"],
  registers: [register],
});

const httpRequestDurationSeconds = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duracion de peticiones HTTP en segundos.",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  registers: [register],
});

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

app.use((req, res, next) => {
  if (req.path === "/metrics") {
    next();
    return;
  }

  const endTimer = httpRequestDurationSeconds.startTimer();
  res.on("finish", () => {
    const route = req.route?.path?.toString() ?? req.path;
    const labels = {
      method: req.method,
      route,
      status_code: res.statusCode.toString(),
    };

    httpRequestsTotal.inc(labels);
    endTimer(labels);
  });

  next();
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "backend", version: "1.0.0" });
});

app.get("/metrics", async (_req, res) => {
  res.setHeader("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.use("/auth", authRoutes);
app.use("/items", itemRoutes);
app.use("/order", orderRoutes);

app.listen(port, () => {
  console.log(`Servidor ts corriendo en http://localhost:${port}`);
});
