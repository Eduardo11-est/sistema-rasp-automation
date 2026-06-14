const supabase = require('../config/supabase');
const store = require('../data/store');

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

  const total = itens.reduce((acc, item) => {
    return acc + (parseFloat(item.quantidade) || 1) * (parseFloat(item.valor_unitario) || 0);
  }, 0);

  if (!supabase) {
    console.warn('Supabase desabilitado, salvando orçamento em memória');
    const orc = store.criarOrcamento({ numero, cliente_nome, cliente_empresa, cliente_telefone, cliente_email, data_validade, condicao_pagto, observacoes, itens, total });
    return res.status(201).json({ sucesso: true, mensagem: 'Orçamento salvo com sucesso!', dados: orc });
  }
  try {
    const { data: orcData, error: orcError } = await supabase
      .from('orcamentos')
      .insert({
        numero: numero.trim(),
        cliente_nome: cliente_nome.trim(),
        cliente_empresa: cliente_empresa ? cliente_empresa.trim() : null,
        cliente_telefone: cliente_telefone ? cliente_telefone.trim() : null,
        cliente_email: cliente_email ? cliente_email.trim() : null,
        data_validade: data_validade || null,
        condicao_pagto: condicao_pagto || null,
        observacoes: observacoes || null,
        total: parseFloat(total.toFixed(2)),
      })
      .select()
      .single();

    if (orcError) throw orcError;

    const itemsToInsert = itens.map(item => ({
      orcamento_id: orcData.id,
      descricao: item.descricao.trim(),
      quantidade: parseFloat(item.quantidade) || 1,
      valor_unitario: parseFloat(item.valor_unitario) || 0,
    }));

    const { data: itemsData, error: itemsError } = await supabase
      .from('orcamento_itens')
      .insert(itemsToInsert)
      .select();

    if (itemsError) {
      await supabase.from('orcamentos').delete().eq('id', orcData.id);
      throw itemsError;
    }

    console.log(`📋 Orçamento ${numero} criado para: ${cliente_nome}`);
    return res.status(201).json({
      sucesso: true,
      mensagem: 'Orçamento salvo com sucesso!',
      dados: {
        ...orcData,
        itens: itemsData,
      },
    });
  } catch (erro) {
    console.warn('Erro ao salvar no Supabase, salvando em memória:', erro.message);
    const orc = store.criarOrcamento({ numero, cliente_nome, cliente_empresa, cliente_telefone, cliente_email, data_validade, condicao_pagto, observacoes, itens, total });
    return res.status(201).json({ sucesso: true, mensagem: 'Orçamento salvo com sucesso!', dados: orc });
  }
};

const listarOrcamentos = async (req, res) => {
  if (!supabase) {
    console.warn('Supabase desabilitado, listando orçamentos da memória');
    const dados = store.listarOrcamentos();
    return res.status(200).json({ sucesso: true, total: dados.length, dados });
  }

  try {
    const { data, error } = await supabase
      .from('orcamentos')
      .select('id, numero, cliente_nome, cliente_empresa, total, status, criado_em')
      .order('criado_em', { ascending: false });

    if (error) throw error;

    return res.status(200).json({ sucesso: true, total: data.length, dados: data });
  } catch (erro) {
    console.warn('Erro ao consultar Supabase, listando da memória:', erro.message);
    const dados = store.listarOrcamentos();
    return res.status(200).json({ sucesso: true, total: dados.length, dados });
  }
};

const buscarOrcamentoPorId = async (req, res) => {
  const { id } = req.params;

  if (!supabase) {
    console.warn('Supabase desabilitado, buscando orçamento da memória');
    const orc = store.buscarOrcamentoPorId(Number(id));
    if (!orc) return res.status(404).json({ sucesso: false, mensagem: 'Orçamento não encontrado.' });
    return res.status(200).json({ sucesso: true, dados: orc });
  }

  try {
    const { data, error } = await supabase
      .from('orcamentos')
      .select('*, orcamento_itens(*)')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ sucesso: false, mensagem: 'Orçamento não encontrado.' });
      }
      throw error;
    }

    return res.status(200).json({
      sucesso: true,
      dados: {
        ...data,
        itens: data.orcamento_itens,
      },
    });
  } catch (erro) {
    console.warn('Erro ao buscar do Supabase, buscando da memória:', erro.message);
    const orc = store.buscarOrcamentoPorId(Number(id));
    if (!orc) return res.status(404).json({ sucesso: false, mensagem: 'Orçamento não encontrado.' });
    return res.status(200).json({ sucesso: true, dados: orc });
  }
};

const atualizarStatusOrcamento = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const statusPermitidos = ['pendente', 'aprovado', 'recusado', 'enviado'];

  if (!statusPermitidos.includes(status)) {
    return res.status(400).json({ sucesso: false, mensagem: `Status inválido. Use: ${statusPermitidos.join(', ')}.` });
  }

  if (!supabase) {
    console.warn('Supabase desabilitado, atualizando status do orçamento em memória');
    const orc = store.atualizarStatusOrcamento(Number(id), status);
    if (!orc) return res.status(404).json({ sucesso: false, mensagem: 'Orçamento não encontrado.' });
    return res.status(200).json({ sucesso: true, dados: { id: orc.id, numero: orc.numero, status: orc.status } });
  }

  try {
    const { data, error } = await supabase
      .from('orcamentos')
      .update({ status })
      .eq('id', id)
      .select('id, numero, status')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ sucesso: false, mensagem: 'Orçamento não encontrado.' });
      }
      throw error;
    }

    return res.status(200).json({ sucesso: true, dados: data });
  } catch (erro) {
    console.warn('Erro ao atualizar status no Supabase, atualizando em memória:', erro.message);
    const orc = store.atualizarStatusOrcamento(Number(id), status);
    if (!orc) return res.status(404).json({ sucesso: false, mensagem: 'Orçamento não encontrado.' });
    return res.status(200).json({ sucesso: true, dados: { id: orc.id, numero: orc.numero, status: orc.status } });
  }
};

module.exports = { criarOrcamento, listarOrcamentos, buscarOrcamentoPorId, atualizarStatusOrcamento };
