const fs = require('fs');
const path = require('path');
const pool = require('./config/db');

async function runSchema() {
  console.log('📖 Carregando schema.sql...');
  const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
  
  try {
    const sql = fs.readFileSync(schemaPath, 'utf8');
    console.log('⚡ Conectando ao Neon e executando o SQL...');
    
    // Executa todo o script SQL
    await pool.query(sql);
    
    console.log('✅ Tabelas criadas e populadas com sucesso no Neon!');
  } catch (err) {
    console.error('❌ Erro ao executar o schema:', err.message);
    if (err.stack) console.error(err.stack);
  } finally {
    await pool.end();
    console.log('🔌 Conexão com o banco fechada.');
  }
}

runSchema();
