import express from "express";
import pg from "pg";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

client.connect();

// Criar tabela automaticamente
await client.query(`
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT,
    invite TEXT,
    banned BOOLEAN DEFAULT false
)
`);

// 1️⃣ Registrar usuário
app.post("/register", async (req, res) => {
    const { username, invite } = req.body;

    await client.query(
        "INSERT INTO users (username, invite, banned) VALUES ($1, $2, false)",
        [username, invite]
    );

    res.json({ success: true });
});

// 2️⃣ Verificar ban
app.get("/checkban/:username", async (req, res) => {
    const { username } = req.params;

    const result = await client.query(
        "SELECT banned FROM users WHERE username = $1",
        [username]
    );

    if (result.rows.length === 0) {
        return res.json({ exists: false });
    }

    res.json({
        exists: true,
        banned: result.rows[0].banned
    });
});

// 3️⃣ Banir usuário manualmente
app.post("/ban", async (req, res) => {
    const { username } = req.body;

    await client.query(
        "UPDATE users SET banned = true WHERE username = $1",
        [username]
    );

    res.json({ success: true });
});

// 4️⃣ Listar usuários
app.get("/users", async (req, res) => {
    const result = await client.query("SELECT * FROM users");
    res.json(result.rows);
});

app.get("/", (req, res) => {
    res.send("API BARRE funcionando.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Rodando na porta " + PORT));

