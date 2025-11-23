import express from "express";
import cors from "cors";
import pkg from "pg";

const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

// Conexão com o Neon
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// =======================
// INVITES
// =======================

// Ver todos os invites
app.get("/invites", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM invites");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// BANIDOS
// =======================

// Ver banidos
app.get("/banned", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM banned");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// CONTAS
// =======================

// Ver todas as contas
app.get("/accounts", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM accounts");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log("API rodando na porta 3000");
});
