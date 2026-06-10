// ============================================================
//  controllers/orcamentosController.js — Orçamentos da Rasp Automação
// ============================================================
const pool  = require('../config/db');
const store = require('../data/store');

// ── Criar Orçamento ─────────────────────────────────────────
const criarOrcamento = async (req, res) => {
  const {
    numero, cliente_nome, cliente_empresa, cliente_telefone,
    cliente_email, data_validade, condicao_pagto, observacoes, itens,
  } = req.body;

  if (!numero || !cliente_nome || !Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Campos obrigatórios: numero, cliente_nome e pelo menos 1 item.',
    });
  }

  // Calcula total
  const total = itens.reduce((acc, item) => {
    return acc + (parseFloat(item.quantidade) || 1) * (parseFloat(item.valor_unitario) || 0);
  }, 0);

  const client = await pool.connect().catch(() => null);

  if (!client) {
    // Fallback em memória
    const orc = store.criarOrcamento({ numero, cliente_nome, cliente_empresa, cliente_telefone, cliente_email, data_validade, condicao_pagto, observacoes, itens, total });
    return res.status(201).json({ sucesso: true, mensagem: 'Orçamento salvo com sucesso!', dados: orc });
  }

  try {
    await client.query('BEGIN');

    const resOrc = await client.query(
      `INSERT INTO orcamentos
        (numero, cliente_nome, cliente_empresa, cliente_telefone, cliente_email, data_validade, condicao_pagto, observacoes, total)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [numero, cliente_nome.trim(), cliente_empresa||null, cliente_telefone||null,
       cliente_email||null, data_validade||null, condicao_pagto||null, observacoes||null, total.toFixed(2)]
    );

    const orcamento = resOrc.rows[0];

    for (const item of itens) {
      await client.query(
        `INSERT INTO orcamento_itens (orcamento_id, descricao, quantidade, valor_unitario)
         VALUES ($1, $2, $3, $4)`,
        [orcamento.id, item.descricao.trim(), parseFloat(item.quantidade)||1, parseFloat(item.valor_unitario)||0]
      );
    }

    await client.query('COMMIT');
    console.log(`📋 Orçamento ${numero} criado para: ${cliente_nome}`);
    return res.status(201).json({ sucesso: true, mensagem: 'Orçamento salvo com sucesso!', dados: orcamento });

  } catch (erro) {
    await client.query('ROLLBACK');
    console.error('Erro ao salvar orçamento no banco:', erro.message);
    // Fallback em memória
    const orc = store.criarOrcamento({ numero, cliente_nome, cliente_empresa, cliente_telefone, cliente_email, data_validade, condicao_pagto, observacoes, itens, total });
    return res.status(201).json({ sucesso: true, mensagem: 'Orçamento salvo com sucesso!', dados: orc });
  } finally {
    client.release();
  }
};

// ── Listar Orçamentos ────────────────────────────────────────
const listarOrcamentos = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, numero, cliente_nome, cliente_empresa, total, status, criado_em FROM orcamentos ORDER BY criado_em DESC'
    );
    return res.status(200).json({ sucesso: true, total: result.rowCount, dados: result.rows });
  } catch (erro) {
    const dados = store.listarOrcamentos();
    return res.status(200).json({ sucesso: true, total: dados.length, dados });
  }
};

// ── Buscar Orçamento por ID ──────────────────────────────────
const buscarOrcamentoPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const resOrc = await pool.query('SELECT * FROM orcamentos WHERE id = $1', [id]);
    if (resOrc.rowCount === 0) return res.status(404).json({ sucesso: false, mensagem: 'Orçamento não encontrado.' });

    const resItens = await pool.query(
      'SELECT id, descricao, quantidade, valor_unitario, valor_total FROM orcamento_itens WHERE orcamento_id = $1',
      [id]
    );

    return res.status(200).json({
      sucesso: true,
      dados: { ...resOrc.rows[0], itens: resItens.rows },
    });
  } catch (erro) {
    const orc = store.buscarOrcamentoPorId(Number(id));
    if (!orc) return res.status(404).json({ sucesso: false, mensagem: 'Orçamento não encontrado.' });
    return res.status(200).json({ sucesso: true, dados: orc });
  }
};

// ── Atualizar Status ─────────────────────────────────────────
const atualizarStatusOrcamento = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const statusPermitidos = ['pendente', 'aprovado', 'recusado', 'enviado'];

  if (!statusPermitidos.includes(status)) {
    return res.status(400).json({ sucesso: false, mensagem: `Status inválido. Use: ${statusPermitidos.join(', ')}.` });
  }

  try {
    const result = await pool.query(
      'UPDATE orcamentos SET status = $1 WHERE id = $2 RETURNING id, numero, status',
      [status, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ sucesso: false, mensagem: 'Orçamento não encontrado.' });
    return res.status(200).json({ sucesso: true, dados: result.rows[0] });
  } catch (erro) {
    return res.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar status.' });
  }
};

module.exports = { criarOrcamento, listarOrcamentos, buscarOrcamentoPorId, atualizarStatusOrcamento };
