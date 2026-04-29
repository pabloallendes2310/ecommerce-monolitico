import express from "express";
import authRoutes from "./modules/auth/auth.routes.js";
import "dotenv/config";
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use("/auth", authRoutes);

app.listen(port, () => {
  console.log(`Servidor ts correidno en http://localhost:${port}`);
});
