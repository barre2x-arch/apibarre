// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { Client } = require('pg');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL;

const pgClient = new Client({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pgClient.connect().then(() => {
  console.log('Connected to Postgres');
  pgClient.query('LISTEN db_events');
});

pgClient.on('notification', (msg) => {
  try {
    const payload = JSON.parse(msg.payload);
    io.emit('db_event', payload);
  } catch (e) {
    console.error('Invalid payload', e);
  }
});

app.get('/status', (req, res) => res.json({ ok: true }));

app.get('/snapshot', async (req, res) => {
  try {
    const accounts = await pgClient.query("SELECT id, username, status, metadata FROM accounts LIMIT 1000");
    const invites = await pgClient.query("SELECT id, code, used_by, used_at, expires_at FROM invites LIMIT 1000");
    res.json({ accounts: accounts.rows, invites: invites.rows });
  } catch (err) {
    res.status(500).json({ error: 'db error' });
  }
});

io.on('connection', (socket) => {
  console.log('client connected');
  
  socket.on('get_snapshot', async () => {
    const accounts = await pgClient.query("SELECT id, username, status FROM accounts LIMIT 1000");
    const invites = await pgClient.query("SELECT id, code, used_by, used_at FROM invites LIMIT 1000");
    socket.emit('snapshot', { accounts: accounts.rows, invites: invites.rows });
  });
});

server.listen(PORT, () => console.log(`Server listening on ${PORT}`));
