const supabase = require('../config/supabase');
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

  if (!supabase) {
    console.warn('Supabase desabilitado, salvando contato em memória');
    const contato = store.criarContato({ nome, email, telefone, assunto, mensagem });
    return res.status(201).json({
      sucesso: true,
      mensagem: 'Mensagem recebida com sucesso! Entraremos em contato em breve.',
      dados: { id: contato.id, nome: contato.nome, email: contato.email, criado_em: contato.criado_em },
    });
  }

  try {
    const { data, error } = await supabase
      .from('contatos')
      .insert({
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        telefone: telefone ? telefone.trim() : null,
        assunto: assunto ? assunto.trim() : null,
        mensagem: mensagem.trim(),
      })
      .select('id, nome, email, criado_em')
      .single();

    if (error) throw error;

    console.log(`📩 Novo contato recebido de: ${data.nome} <${data.email}>`);
    return res.status(201).json({
      sucesso: true,
      mensagem: 'Mensagem recebida com sucesso! Entraremos em contato em breve.',
      dados: data,
    });
  } catch (erro) {
    console.warn('Erro ao salvar no Supabase, salvando em memória:', erro.message);
    const contato = store.criarContato({ nome, email, telefone, assunto, mensagem });
    return res.status(201).json({
      sucesso: true,
      mensagem: 'Mensagem recebida com sucesso! Entraremos em contato em breve.',
      dados: { id: contato.id, nome: contato.nome, email: contato.email, criado_em: contato.criado_em },
    });
  }
};

const listarContatos = async (req, res) => {
  if (!supabase) {
    console.warn('Supabase desabilitado, listando contatos em memória');
    const dados = store.listarContatos();
    return res.status(200).json({
      sucesso: true,
      total: dados.length,
      dados,
    });
  }

  try {
    const { data, error } = await supabase
      .from('contatos')
      .select('id, nome, email, telefone, assunto, criado_em')
      .order('criado_em', { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      sucesso: true,
      total: data.length,
      dados: data,
    });
  } catch (erro) {
    console.warn('Erro ao consultar Supabase, listando da memória:', erro.message);
    const dados = store.listarContatos();
    return res.status(200).json({
      sucesso: true,
      total: dados.length,
      dados,
    });
  }
};

module.exports = { criarContato, listarContatos };
