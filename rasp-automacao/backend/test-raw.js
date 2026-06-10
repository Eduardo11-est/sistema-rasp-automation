require('dotenv').config();
const { Client } = require('pg');

async function test() {
  const client = new Client({
    host: 'aws-0-sa-east-1.pooler.supabase.com',
    port: 6543,
    user: 'postgres.omizonksqfxhdkgtvejw',
    password: 'Ebo2001!2001',
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 30000,
  });

  console.log('Connecting with Client directly...');

  try {
    await client.connect();
    console.log('Connected!');
    const res = await client.query('SELECT NOW() as now');
    console.log('Query result:', res.rows[0]);
    await client.end();
  } catch (err) {
    console.error('Error:', err.message);
    console.error('Code:', err.code);
    console.error('Stack:', err.stack?.split('\n').slice(0, 3).join('\n'));
  }
}

test();
