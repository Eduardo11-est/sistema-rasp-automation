const pool = require('../config/db');
const store = require('../data/store');

const listarServicos = async (req, res) => {
  try {
    const resultado = await pool.query(
      'SELECT id, titulo, descricao_curta, descricao_longa, imagem_url FROM servicos ORDER BY id ASC'
    );
    return res.status(200).json({
      sucesso: true,
      total: resultado.rowCount,
      dados: resultado.rows,
    });
  } catch (erro) {
    console.warn('Banco indisponível, usando dados em memória:', erro.message);
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
  try {
    const resultado = await pool.query(
      'SELECT id, titulo, descricao_curta, descricao_longa, imagem_url FROM servicos WHERE id = $1',
      [id]
    );
    if (resultado.rowCount === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: `Serviço com ID ${id} não encontrado.`,
      });
    }
    return res.status(200).json({
      sucesso: true,
      dados: resultado.rows[0],
    });
  } catch (erro) {
    console.warn('Banco indisponível, usando dados em memória:', erro.message);
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
