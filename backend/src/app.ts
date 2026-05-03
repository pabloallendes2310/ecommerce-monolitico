import express from "express";
import authRoutes from "./modules/auth/auth.routes.js";
import itemRoutes from "./modules/item/item.routes.js";
import orderRoutes from "./modules/order/order.routes.js";
import "dotenv/config";
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/items", itemRoutes);
app.use("/order", orderRoutes);

app.listen(port, () => {
  console.log(`Servidor ts correidno en http://localhost:${port}`);
});
