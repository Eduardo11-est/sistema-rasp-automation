// ============================================================
//  server.js — Entrypoint do servidor Express (Rasp Automação)
// ============================================================
require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const path    = require('path');
const apiRoutes = require('./routes/api');

const app  = express();
const PORT = process.env.PORT || 3000;

// ============================================================
//  Middlewares Globais
// ============================================================

// CORS: permite requisições do frontend (configurável via .env)
app.use(cors({
  origin:  process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parsing de JSON no corpo das requisições
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve arquivos estáticos do frontend (opcional em produção)
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ============================================================
//  Rotas da API
// ============================================================
app.use('/api', apiRoutes);

// Redireciona qualquer rota não-API para o index.html do frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// ============================================================
//  Middleware de Tratamento de Erros Global
// ============================================================
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('❌ Erro não tratado:', err.stack);
  res.status(500).json({
    sucesso:  false,
    mensagem: 'Ocorreu um erro interno no servidor.',
  });
});

// ============================================================
//  Inicialização do Servidor
// ============================================================
app.listen(PORT, () => {
  console.log('');
  console.log('╔═══════════════════════════════════════════╗');
  console.log('║   🔌 Rasp Automação — Backend API         ║');
  console.log(`║   🚀 Servidor rodando na porta ${PORT}        ║`);
  console.log(`║   🌐 http://localhost:${PORT}               ║`);
  console.log(`║   📡 API:  http://localhost:${PORT}/api      ║`);
  console.log('╚═══════════════════════════════════════════╝');
  console.log('');
});
