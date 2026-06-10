// ============================================================
//  routes/api.js — Registro central de todas as rotas da API
// ============================================================
const express = require('express');
const router  = express.Router();

const { listarServicos, buscarServicoPorId }                                = require('../controllers/servicosController');
const { criarContato, listarContatos }                                      = require('../controllers/contatosController');
const { criarOrcamento, listarOrcamentos, buscarOrcamentoPorId, atualizarStatusOrcamento } = require('../controllers/orcamentosController');

// --- Health Check ---
router.get('/health', (req, res) => {
  res.status(200).json({
    sucesso: true,
    status:  'online',
    versao:  '1.0.0',
    horario: new Date().toISOString(),
  });
});

// --- Rotas de Serviços ---
router.get('/servicos',     listarServicos);
router.get('/servicos/:id', buscarServicoPorId);

// --- Rotas de Contatos ---
router.post('/contatos', criarContato);
router.get('/contatos',  listarContatos);

// --- Rotas de Orçamentos ---
router.post('/orcamentos',              criarOrcamento);
router.get('/orcamentos',               listarOrcamentos);
router.get('/orcamentos/:id',           buscarOrcamentoPorId);
router.patch('/orcamentos/:id/status',  atualizarStatusOrcamento);

module.exports = router;

