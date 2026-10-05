import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: parseInt(process.env.DB_MAX_CONNECTIONS, 10) || 30,
  idleTimeoutMillis: 60000,
  // Wait this long for a free client before giving up. Under load this must exceed
  // the slowest expected query, otherwise queued requests fail with
  // "timeout exceeded when trying to connect" while the database is perfectly healthy.
  connectionTimeoutMillis: 15000,
  // Cap how long a single query may run, so a pathological search cannot hold a
  // pool slot indefinitely and starve every other request.
  query_timeout: 10000,
  statement_timeout: 10000,
});

pool.on('error', (err) => {
  console.error('Unexpected pool error:', err);
  process.exit(-1);
});

export const query = (text, params) => pool.query(text, params);
export default pool;
