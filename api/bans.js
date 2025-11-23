const { Pool } = require("pg");
const requireApiKey = require("./_auth");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
  const key = await requireApiKey(req, res);
  if (!key) return;

  const r = await pool.query(
    "SELECT id, account_id, external_identifier, reason, banned_at, banned_until FROM bans WHERE active=true"
  );

  res.json(r.rows);
};
