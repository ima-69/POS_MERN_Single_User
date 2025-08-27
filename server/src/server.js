import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.get("/", (req, res) => {
      res.send("WELCOME TO Gihan POS API!");
    });
  })
  .catch((err) => {
    console.error("DB connection failed", err);
    process.exit(1);
  });
