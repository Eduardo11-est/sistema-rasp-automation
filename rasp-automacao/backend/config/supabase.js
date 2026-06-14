const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const USE_DATABASE = process.env.USE_DATABASE === 'true';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let supabase = null;

if (USE_DATABASE && supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Cliente Supabase inicializado com sucesso!');
  } catch (err) {
    console.error('❌ Erro ao inicializar o cliente Supabase:', err.message);
  }
} else {
  console.log('ℹ️  Modo sem banco ativado (ou chaves ausentes) — dados em memória.');
}

module.exports = supabase;
