import express from "express";
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;
const app = express();
app.use(express.json());

// Conexão com o banco PostgreSQL da Render
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// =========================
//      ROTAS DA API
// =========================

// Criar conta
app.post("/register", async (req, res) => {
    const { username, invite } = req.body;

    try {
        const inviteCheck = await pool.query(
            "SELECT * FROM invites WHERE code = $1 AND used = false",
            [invite]
        );

        if (inviteCheck.rowCount === 0) {
            return res.status(400).json({ error: "Invite inválido ou já usado" });
        }

        await pool.query(
            "INSERT INTO users (username, invite) VALUES ($1, $2)",
            [username, invite]
        );

        await pool.query(
            "UPDATE invites SET used = true WHERE code = $1",
            [invite]
        );

        res.json({ success: true, message: "Conta criada!" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Listar invites
app.get("/getInvites", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM invites");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Verificar banimento
app.get("/ban/:user", async (req, res) => {
    const user = req.params.user;

    try {
        const result = await pool.query(
            "SELECT * FROM banned WHERE username = $1",
            [user]
        );

        if (result.rowCount > 0) {
            return res.json({ banned: true });
        }

        res.json({ banned: false });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Porta da API
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`API rodando na porta ${PORT}`));
