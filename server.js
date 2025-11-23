import express from "express";
import pkg from "pg";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const { Pool } = pkg;

const app = express();
app.use(express.json());
app.use(cors());

// Conexão PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ===============================
// AUTO CRIAR TABELAS AO INICIAR
// ===============================
async function createTables() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bans (
        id SERIAL PRIMARY KEY,
        userid TEXT,
        motivo TEXT
      );

      CREATE TABLE IF NOT EXISTS invites (
        id SERIAL PRIMARY KEY,
        invite TEXT
      );

      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        userid TEXT,
        invite TEXT
      );
    `);

    console.log("✔ Tabelas verificadas/criadas com sucesso.");
  } catch (err) {
    console.error("Erro ao criar tabelas:", err);
  }
}

createTables(); // Chama ao iniciar

// ===========================
// ROTAS BANIDOS
// ===========================

// Adicionar banido
app.post("/ban/add", async (req, res) => {
  const { userid, motivo } = req.body;

  try {
    await pool.query(
      "INSERT INTO bans (userid, motivo) VALUES ($1, $2)",
      [userid, motivo]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Listar banidos
app.get("/ban/list", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM bans");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===========================
// ROTAS INVITES
// ===========================

// Adicionar invite
app.post("/invite/add", async (req, res) => {
  const { invite } = req.body;

  try {
    await pool.query("INSERT INTO invites (invite) VALUES ($1)", [invite]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Listar invites
app.get("/invite/list", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM invites");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===========================
// ROTAS USERS
// ===========================

// Adicionar usuário
app.post("/users/add", async (req, res) => {
  const { userid, invite } = req.body;

  try {
    await pool.query(
      "INSERT INTO users (userid, invite) VALUES ($1, $2)",
      [userid, invite]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Listar usuários
app.get("/users/list", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===========================
// START SERVER
// ===========================
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`API rodando na porta ${PORT}`));
