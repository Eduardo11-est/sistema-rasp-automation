require('dotenv').config();
const { Pool } = require('pg');

async function test() {
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'defined' : 'undefined');
  console.log('Connecting with 60s timeout...');

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 60000,
  });

  try {
    const client = await pool.connect();
    console.log('Connected!');
    const res = await client.query('SELECT NOW() as now');
    console.log('Query result:', res.rows[0]);
    client.release();
    await pool.end();
  } catch (err) {
    console.error('Error:', err.message);
    console.error('Code:', err.code);
    if (err.stack) console.error('Stack:', err.stack);
  }
}

test();
