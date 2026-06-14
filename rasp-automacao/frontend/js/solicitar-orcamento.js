/**
 * ============================================================
 *  solicitar-orcamento.js — Lógica do Formulário de Cliente
 *  Rasp Automação — Uso do Cliente Final
 * ============================================================
 */
'use strict';

const API_BASE = 'http://localhost:3000/api';

// --- Elementos ---
const form          = document.getElementById('form-solicitar');
const servicesGrid  = document.getElementById('services-grid');
const loadingEl     = document.getElementById('services-loading');
const feedbackEl    = document.getElementById('form-feedback');
const btnSubmit     = document.getElementById('btn-submit');
const inputPhone    = document.getElementById('telefone');
const erroServicos  = document.getElementById('erro-servicos');

let servicosCarregados = [];

// --- 1. Gerar Número de Requisição ---
function gerarNumeroRequisicao() {
  const ano = new Date().getFullYear();
  const seq = String(Date.now()).slice(-5);
  return `REQ-${ano}-${seq}`;
}

// --- 2. Ano Dinâmico no Footer ---
document.getElementById('footer-year').textContent = new Date().getFullYear();

// --- 3. Carregar Serviços Dinamicamente ---
async function carregarServicosForm() {
  try {
    const res = await fetch(`${API_BASE}/servicos`);
    if (!res.ok) throw new Error('Falha HTTP');

    const { dados } = await res.json();
    if (!Array.isArray(dados) || dados.length === 0) throw new Error('Sem dados');

    servicosCarregados = dados;
    renderCheckboxes(dados);
  } catch (err) {
    console.warn('Erro ao buscar serviços da API, usando lista estática de fallback:', err.message);
    const fallbackList = [
      { id: 1, titulo: 'Instalações Elétricas', descricao_curta: 'Projetos e execução de instalações elétricas industriais e comerciais.' },
      { id: 2, titulo: 'Controle e Automação', descricao_curta: 'Soluções de automação industrial, sensores e painéis de controle.' },
      { id: 3, titulo: 'Montagem de Painéis', descricao_curta: 'Fabricação e montagem de quadros de comando, distribuição e CCM.' },
      { id: 4, titulo: 'Projetos Elétricos', descricao_curta: 'Elaboração de projetos elétricos, laudos e memoriais.' },
      { id: 5, titulo: 'Manutenção em Geral', descricao_curta: 'Manutenção elétrica preventiva e corretiva industrial.' },
      { id: 6, titulo: 'Programação CLPs e IHMs', descricao_curta: 'Programação de controladores lógicos e interfaces homem-máquina.' },
    ];
    servicosCarregados = fallbackList;
    renderCheckboxes(fallbackList);
  }

  // Pre-selecionar serviço vindo via parâmetro URL
  preselecionarServicoURL();
}

function preselecionarServicoURL() {
  const params = new URLSearchParams(window.location.search);
  const servicoParam = params.get('servico');
  
  if (servicoParam) {
    const chk = Array.from(document.querySelectorAll('input[name="servicos_selecionados"]'))
      .find(input => input.value.toLowerCase() === servicoParam.toLowerCase());
      
    if (chk) {
      chk.checked = true;
      const label = chk.closest('.service-option');
      if (label) label.classList.add('checked');
    }
  }
}

function renderCheckboxes(servicos) {
  loadingEl.classList.add('hidden');
  servicesGrid.classList.remove('hidden');
  servicesGrid.innerHTML = '';

  servicos.forEach(servico => {
    const option = document.createElement('label');
    option.className = 'service-option';
    option.dataset.id = servico.id;

    option.innerHTML = `
      <input type="checkbox" name="servicos_selecionados" value="${servico.titulo}" />
      <span class="custom-checkbox" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </span>
      <span class="service-option-text">
        <span class="service-option-title">${servico.titulo}</span>
        <span class="service-option-desc">${servico.descricao_curta}</span>
      </span>
    `;

    // Correção: Ouvir evento "change" do checkbox nativo para atualizar estilo visual
    const checkbox = option.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', () => {
      option.classList.toggle('checked', checkbox.checked);
      erroServicos.textContent = ''; // Limpa erro de seleção
    });

    servicesGrid.appendChild(option);
  });
}

// --- 4. Máscara de Telefone ---
inputPhone.addEventListener('input', (e) => {
  let v = e.target.value.replace(/\D/g, '');
  if (v.length === 0) {
    e.target.value = '';
  } else if (v.length <= 2) {
    e.target.value = `(${v}`;
  } else if (v.length <= 6) {
    e.target.value = `(${v.slice(0, 2)}) ${v.slice(2)}`;
  } else if (v.length <= 10) {
    e.target.value = `(${v.slice(0, 2)}) ${v.slice(2, 6)}-${v.slice(6)}`;
  } else {
    e.target.value = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7, 11)}`;
  }
});

// --- 5. Validação e Envio ---
const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validarForm() {
  let valido = true;

  // Nome
  const nome = document.getElementById('nome');
  const erroNome = document.getElementById('erro-nome');
  if (nome.value.trim().length < 3) {
    erroNome.textContent = 'O nome deve conter pelo menos 3 caracteres.';
    nome.classList.add('invalid');
    valido = false;
  } else {
    erroNome.textContent = '';
    nome.classList.remove('invalid');
  }

  // Email
  const email = document.getElementById('email');
  const erroEmail = document.getElementById('erro-email');
  if (!regexEmail.test(email.value.trim())) {
    erroEmail.textContent = 'Por favor, informe um e-mail válido.';
    email.classList.add('invalid');
    valido = false;
  } else {
    erroEmail.textContent = '';
    email.classList.remove('invalid');
  }

  // Telefone
  const telefone = document.getElementById('telefone');
  const erroTelefone = document.getElementById('erro-telefone');
  if (telefone.value.trim().replace(/\D/g, '').length < 10) {
    erroTelefone.textContent = 'Informe um telefone/WhatsApp válido com DDD.';
    telefone.classList.add('invalid');
    valido = false;
  } else {
    erroTelefone.textContent = '';
    telefone.classList.remove('invalid');
  }

  // Checkboxes
  const selecionados = Array.from(document.querySelectorAll('input[name="servicos_selecionados"]:checked'));
  if (selecionados.length === 0) {
    erroServicos.textContent = 'Selecione pelo menos um serviço para o orçamento.';
    valido = false;
  } else {
    erroServicos.textContent = '';
  }

  return valido;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  ocultarFeedback();

  if (!validarForm()) return;

  setLoading(true);

  // Mapear os serviços selecionados como itens do orçamento
  const servicosMarcados = Array.from(document.querySelectorAll('input[name="servicos_selecionados"]:checked'))
    .map(chk => chk.value);

  const itens = servicosMarcados.map(servico => ({
    descricao: `Serviço solicitado: ${servico}`,
    quantidade: 1,
    valor_unitario: 0
  }));

  const payload = {
    numero:           gerarNumeroRequisicao(),
    cliente_nome:     document.getElementById('nome').value.trim(),
    cliente_email:    document.getElementById('email').value.trim(),
    cliente_telefone: document.getElementById('telefone').value.trim(),
    cliente_empresa:  document.getElementById('empresa').value.trim() || null,
    observacoes:      document.getElementById('observacoes').value.trim() || null,
    itens
  };

  try {
    const res = await fetch(`${API_BASE}/orcamentos`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok || !data.sucesso) throw new Error(data.mensagem || `Erro ${res.status}`);

    exibirFeedback(
      `✓ Sua solicitação de orçamento (${payload.numero}) foi enviada com sucesso! Entraremos em contato em breve. Se preferir, nos chame no <a href="https://wa.me/5511963987438?text=Olá!%20Acabei%20de%20solicitar%20o%20orçamento%20número%20${payload.numero}" target="_blank" rel="noopener noreferrer">WhatsApp</a>.`,
      'success'
    );
    form.reset();
    document.querySelectorAll('.service-option').forEach(opt => opt.classList.remove('checked'));

  } catch (err) {
    console.error('Erro ao salvar solicitação:', err.message);
    exibirFeedback(
      `⚠ Não foi possível enviar sua solicitação de orçamento: ${err.message}. Por favor, tente falar diretamente pelo nosso WhatsApp (11) 96398-7438.`,
      'error'
    );
  } finally {
    setLoading(false);
  }
});

// --- 6. Helpers ---
function setLoading(loading) {
  btnSubmit.disabled = loading;
  btnSubmit.classList.toggle('btn--loading', loading);
  btnSubmit.querySelector('.btn-text').textContent = loading ? 'Enviando Solicitação...' : 'Enviar Solicitação';
}

function exibirFeedback(msg, tipo) {
  feedbackEl.innerHTML = msg;
  feedbackEl.className = `form-feedback ${tipo}`;
  feedbackEl.classList.remove('hidden');
  feedbackEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function ocultarFeedback() {
  feedbackEl.className = 'form-feedback hidden';
  feedbackEl.innerHTML = '';
}

// Inicializar carregamento de serviços
carregarServicosForm();
