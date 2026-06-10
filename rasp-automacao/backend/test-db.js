require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.query('SELECT * FROM servicos', (err, res) => {
  if (err) {
    console.error('❌ Erro na consulta:', err.message);
  } else {
    console.log('✅ Conexão com Supabase estabelecida com sucesso!');
    console.log(`📊 Total de serviços recuperados do banco: ${res.rows.length}`);
    console.log('📋 Primeiros resultados:');
    console.table(res.rows.map(r => ({ id: r.id, titulo: r.titulo })));
  }
  pool.end();
});
