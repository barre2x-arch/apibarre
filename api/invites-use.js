const { Pool } = require("pg");
const requireApiKey = require("./_auth");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
  const key = await requireApiKey(req, res);
  if (!key) return;

  if (req.method !== "POST") {
    res.status(405).json({ error: "POST required" });
    return;
  }

  const code = req.query.code;
  const { used_by } = req.body;
  const now = new Date();

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const q = await client.query(
      "SELECT * FROM invites WHERE code=$1 FOR UPDATE",
      [code]
    );

    if (!q.rows.length) {
      await client.query("ROLLBACK");
      res.status(404).json({ error: "invite not found" });
      return;
    }

    const invite = q.rows[0];
    if (invite.status !== "available") {
      await client.query("ROLLBACK");
      res.status(400).json({ error: "invite not available" });
      return;
    }

    await client.query(
      "UPDATE invites SET status='used', used_by=$1, used_at=$2 WHERE code=$3",
      [used_by, now, code]
    );

    await client.query("COMMIT");

    res.json({ ok: true });
  } catch (e) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: "internal error" });
  } finally {
    client.release();
  }
};
