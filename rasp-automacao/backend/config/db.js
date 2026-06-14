// ============================================================
//  config/db.js — Pool de conexão com o PostgreSQL
// ============================================================
const { Pool } = require('pg');
require('dotenv').config();

const USE_DATABASE = process.env.USE_DATABASE === 'true';

let pool;

if (USE_DATABASE) {
  const poolConfig = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        connectionTimeoutMillis: 5000,
        idleTimeoutMillis: 10000,
        ssl: { rejectUnauthorized: false },
      }
    : {
        host:     process.env.DB_HOST     || 'localhost',
        port:     parseInt(process.env.DB_PORT) || 5432,
        user:     process.env.DB_USER     || 'postgres',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME     || 'rasp_automacao',
        connectionTimeoutMillis: 5000,
        idleTimeoutMillis: 10000,
        ssl:      process.env.DB_SSL === 'true' || (process.env.DB_HOST && !['localhost', '127.0.0.1'].includes(process.env.DB_HOST)) ? { rejectUnauthorized: false } : false,
      };

  pool = new Pool(poolConfig);

  pool.connect((err, client, release) => {
    if (err) {
      console.log('ℹ️  Banco de dados não disponível — usando armazenamento em memória.');
    } else {
      release();
      console.log('✅ Conexão com o PostgreSQL estabelecida com sucesso!');
    }
  });
} else {
  // Mock pool que sempre usa o store em memória
  pool = {
    query: () => Promise.reject(new Error('Banco desabilitado (USE_DATABASE=false)')),
    connect: () => Promise.reject(new Error('Banco desabilitado (USE_DATABASE=false)')),
    end: () => Promise.resolve(),
  };
  console.log('ℹ️  Modo sem banco ativado — dados em memória.');
}

module.exports = pool;
