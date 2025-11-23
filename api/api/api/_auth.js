const crypto = require("crypto");
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = async function requireApiKey(req, res) {
  const key = req.headers["x-api-key"];
  if (!key) {
    res.status(401).json({ error: "missing api key" });
    return null;
  }

  const hash = crypto.createHash("sha256").update(key).digest("hex");

  const result = await pool.query(
    "SELECT * FROM api_keys WHERE key_hash=$1 AND revoked=false",
    [hash]
  );

  if (result.rows.length === 0) {
    res.status(401).json({ error: "invalid api key" });
    return null;
  }

  return result.rows[0];
};
