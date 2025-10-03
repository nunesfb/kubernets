import express from "express";
import pkg from "pg";
import { createClient } from "redis";

const {
  PGHOST = "postgres",
  PGUSER = "app",
  PGPASSWORD = "changeme",
  PGDATABASE = "appdb",
  PGPORT = "5432",
  REDIS_HOST = "redis",
  REDIS_PORT = "6379",
  PORT = "3000",
} = process.env;

const { Pool } = pkg;
const pool = new Pool({
  host: PGHOST, user: PGUSER, password: PGPASSWORD, database: PGDATABASE, port: +PGPORT,
});

const redis = createClient({ url: `redis://${REDIS_HOST}:${REDIS_PORT}` });
redis.on("error", (e) => console.error("Redis error", e));

const app = express();
app.use(express.json());

app.get("/healthz", (req, res) => res.send("ok"));
app.get("/readyz", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    await redis.ping();
    return res.send("ready");
  } catch {
    return res.status(500).send("not-ready");
  }
});

app.get("/api/ping", (req, res) => res.json({ pong: true, at: new Date().toISOString() }));

app.get("/api/cache", async (req, res) => {
  const key = "demo:contador";
  const current = Number((await redis.get(key)) || 0) + 1;
  await redis.set(key, String(current));
  res.json({ key, current });
});

app.get("/api/users", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT id, name FROM users ORDER BY id");
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "db_error" });
  }
});

app.post("/api/users", async (req, res) => {
  const { name } = req.body || {};
  if (!name) return res.status(400).json({ error: "name_required" });
  try {
    const { rows } = await pool.query(
      "INSERT INTO users(name) VALUES($1) RETURNING id, name",
      [name]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "db_error" });
  }
});

const start = async () => {
  await redis.connect();
  // cria tabela simples (id serial, name text)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users(
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL
    )
  `);
  app.listen(+PORT, () => console.log(`API on :${PORT}`));
};

start().catch((e) => {
  console.error("Failed to start", e);
  process.exit(1);
});
