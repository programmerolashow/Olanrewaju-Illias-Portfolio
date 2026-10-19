// Applies db/migrations/*.sql in name order, once each, recording them in schema_migrations.
// Usage: npm run db:migrate   (reads DATABASE_URL from the environment or .env.local)
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { Pool } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL && existsSync(".env.local")) {
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*DATABASE_URL\s*=\s*"?([^"]*)"?\s*$/);
    if (match) process.env.DATABASE_URL = match[1];
  }
}
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set (run `neon env pull` first).");
  process.exit(1);
}

const dir = "db/migrations";
const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

try {
  await pool.query(`create table if not exists schema_migrations (name text primary key, applied_at timestamptz not null default now())`);
  const { rows } = await pool.query(`select name from schema_migrations`);
  const applied = new Set(rows.map((r) => r.name));

  for (const file of files) {
    if (applied.has(file)) {
      console.log(`skip    ${file}`);
      continue;
    }
    const client = await pool.connect();
    try {
      await client.query("begin");
      await client.query(readFileSync(join(dir, file), "utf8"));
      await client.query("insert into schema_migrations (name) values ($1)", [file]);
      await client.query("commit");
      console.log(`applied ${file}`);
    } catch (error) {
      await client.query("rollback");
      throw new Error(`${file} failed: ${error.message}`);
    } finally {
      client.release();
    }
  }
} finally {
  await pool.end();
}
