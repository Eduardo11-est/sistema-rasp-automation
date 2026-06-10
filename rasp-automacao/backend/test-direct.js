require('dotenv').config();
const { Pool } = require('pg');

async function test() {
  // Try with individual connection params to avoid URL parsing issues
  const pool = new Pool({
    host: 'aws-0-sa-east-1.pooler.supabase.com',
    port: 6543,
    user: 'postgres.omizonksqfxhdkgtvejw',
    password: 'Ebo2001!2001',
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 30000,
  });

  console.log('Connecting with explicit params...');

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
  }
}

test();
