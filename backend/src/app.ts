import express, { type Request, type Response } from "express";
import "dotenv/config";
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hola desde Express con ts" });
});

app.listen(port, () => {
  console.log(`Servidor ts correidno en http://localhost:${port}`);
});
