const pool = require('../config/db');
const store = require('../data/store');

const criarContato = async (req, res) => {
  const { nome, email, telefone, assunto, mensagem } = req.body;

  const camposObrigatorios = { nome, email, mensagem };
  const camposFaltando = Object.entries(camposObrigatorios)
    .filter(([, valor]) => !valor || String(valor).trim() === '')
    .map(([campo]) => campo);

  if (camposFaltando.length > 0) {
    return res.status(400).json({
      sucesso: false,
      mensagem: `Os seguintes campos são obrigatórios: ${camposFaltando.join(', ')}.`,
    });
  }

  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regexEmail.test(email)) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'O endereço de e-mail informado é inválido.',
    });
  }

  try {
    const resultado = await pool.query(
      `INSERT INTO contatos (nome, email, telefone, assunto, mensagem)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, nome, email, criado_em`,
      [
        nome.trim(),
        email.trim().toLowerCase(),
        telefone ? telefone.trim() : null,
        assunto ? assunto.trim() : null,
        mensagem.trim(),
      ]
    );
    console.log(`📩 Novo contato recebido de: ${resultado.rows[0].nome} <${resultado.rows[0].email}>`);
    return res.status(201).json({
      sucesso: true,
      mensagem: 'Mensagem recebida com sucesso! Entraremos em contato em breve.',
      dados: resultado.rows[0],
    });
  } catch (erro) {
    console.warn('Banco indisponível, salvando contato em memória:', erro.message);
    const contato = store.criarContato({ nome, email, telefone, assunto, mensagem });
    console.log(`📩 Novo contato recebido (memória): ${contato.nome} <${contato.email}>`);
    return res.status(201).json({
      sucesso: true,
      mensagem: 'Mensagem recebida com sucesso! Entraremos em contato em breve.',
      dados: { id: contato.id, nome: contato.nome, email: contato.email, criado_em: contato.criado_em },
    });
  }
};

const listarContatos = async (req, res) => {
  try {
    const resultado = await pool.query(
      'SELECT id, nome, email, telefone, assunto, criado_em FROM contatos ORDER BY criado_em DESC'
    );
    return res.status(200).json({
      sucesso: true,
      total: resultado.rowCount,
      dados: resultado.rows,
    });
  } catch (erro) {
    console.warn('Banco indisponível, listando contatos da memória:', erro.message);
    const dados = store.listarContatos();
    return res.status(200).json({
      sucesso: true,
      total: dados.length,
      dados,
    });
  }
};

module.exports = { criarContato, listarContatos };
