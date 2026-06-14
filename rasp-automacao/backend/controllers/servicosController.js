const supabase = require('../config/supabase');
const store = require('../data/store');

const listarServicos = async (req, res) => {
  if (!supabase) {
    console.warn('Supabase desabilitado, usando dados em memória');
    const dados = store.listarServicos();
    return res.status(200).json({
      sucesso: true,
      total: dados.length,
      dados,
    });
  }

  try {
    const { data, error } = await supabase
      .from('servicos')
      .select('id, titulo, descricao_curta, descricao_longa, imagem_url')
      .order('id', { ascending: true });

    if (error) throw error;

    return res.status(200).json({
      sucesso: true,
      total: data.length,
      dados: data,
    });
  } catch (erro) {
    console.warn('Erro ao consultar Supabase, usando dados em memória:', erro.message);
    const dados = store.listarServicos();
    return res.status(200).json({
      sucesso: true,
      total: dados.length,
      dados,
    });
  }
};

const buscarServicoPorId = async (req, res) => {
  const { id } = req.params;
  if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'ID inválido. Deve ser um número inteiro positivo.',
    });
  }

  if (!supabase) {
    console.warn('Supabase desabilitado, usando dados em memória');
    const servico = store.buscarServicoPorId(Number(id));
    if (!servico) {
      return res.status(404).json({
        sucesso: false,
        mensagem: `Serviço com ID ${id} não encontrado.`,
      });
    }
    return res.status(200).json({
      sucesso: true,
      dados: servico,
    });
  }

  try {
    const { data, error } = await supabase
      .from('servicos')
      .select('id, titulo, descricao_curta, descricao_longa, imagem_url')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          sucesso: false,
          mensagem: `Serviço com ID ${id} não encontrado.`,
        });
      }
      throw error;
    }

    return res.status(200).json({
      sucesso: true,
      dados: data,
    });
  } catch (erro) {
    console.warn('Erro ao consultar Supabase, usando dados em memória:', erro.message);
    const servico = store.buscarServicoPorId(Number(id));
    if (!servico) {
      return res.status(404).json({
        sucesso: false,
        mensagem: `Serviço com ID ${id} não encontrado.`,
      });
    }
    return res.status(200).json({
      sucesso: true,
      dados: servico,
    });
  }
};

module.exports = { listarServicos, buscarServicoPorId };
