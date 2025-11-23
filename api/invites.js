const { Pool } = require("pg");
const requireApiKey = require("./_auth");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
  const key = await requireApiKey(req, res);
  if (!key) return;

  const status = req.query.status || "available";

  const q = await pool.query(
    "SELECT code, created_at, expires_at, status FROM invites WHERE status=$1",
    [status]
  );

  res.json(q.rows);
};
