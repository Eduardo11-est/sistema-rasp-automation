/**
 * ============================================================
 *  Rasp Automação — main.js
 *  JavaScript Vanilla ES6+ responsável por:
 *    1. Navegação sticky + menu mobile
 *    2. Carregamento dinâmico de serviços via API
 *    3. Modal interativo de detalhes do serviço
 *    4. Formulário de contato com validação e fetch POST
 *    5. Máscara de telefone
 *    6. Scroll suave + link ativo na nav
 *    7. Ano dinâmico no footer
 * ============================================================
 */

'use strict';

// ============================================================
//  CONFIGURAÇÃO
// ============================================================

/** URL base da API backend. Altere em produção. */
const API_BASE_URL = 'http://localhost:3000/api';

/** Ícones SVG por índice de serviço (1-based) */
const SERVICO_ICONS = {
  1: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`,
  2: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49M7.76 7.76a6 6 0 0 0 0 8.49"/></svg>`,
  3: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>`,
  4: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  5: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
  6: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
};

/** Ícone padrão para serviços sem ícone específico */
const ICON_DEFAULT = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`;

// ============================================================
//  UTILITÁRIOS
// ============================================================

/**
 * Seletor curto (atalho para querySelector)
 * @param {string} selector
 * @param {Document|Element} [context=document]
 */
const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

/**
 * Adiciona/remove a classe 'hidden' e atualiza aria-hidden
 * @param {Element} el
 * @param {boolean} visible
 */
function toggleVisibility(el, visible) {
  if (!el) return;
  el.classList.toggle('hidden', !visible);
  el.setAttribute('aria-hidden', String(!visible));
}

// ============================================================
//  1. HEADER STICKY + MENU MOBILE
// ============================================================

(function initNavigation() {
  const header    = $('#header');
  const toggle    = $('#nav-toggle');
  const navMenu   = $('#nav-menu');

  if (!header || !toggle || !navMenu) return;

  // --- Sticky: adiciona classe ao rolar ---
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // --- Menu mobile toggle ---
  toggle.addEventListener('click', () => {
    const isOpen = toggle.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    navMenu.classList.toggle('open', isOpen);
  });

  // --- Fecha menu ao clicar em link ---
  $$('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      navMenu.classList.remove('open');
    });
  });

  // --- Link ativo ao rolar (Intersection Observer) ---
  const sections = $$('main section[id]');
  const navLinks = $$('.nav__link');

  const observerOptions = { rootMargin: '-40% 0px -55% 0px', threshold: 0 };
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, observerOptions);

  sections.forEach(s => sectionObserver.observe(s));
})();

// ============================================================
//  2. ANO DINÂMICO NO FOOTER
// ============================================================

(function initFooterYear() {
  const el = $('#footer-year');
  if (el) el.textContent = new Date().getFullYear();
})();

// ============================================================
//  3. CARREGAMENTO DINÂMICO DE SERVIÇOS
// ============================================================

(function initServicos() {
  const gridEl    = $('#servicos-grid');
  const loadingEl = $('#servicos-loading');
  const errorEl   = $('#servicos-error');

  if (!gridEl) return;

  async function carregarServicos() {
    toggleVisibility(loadingEl, true);
    toggleVisibility(errorEl, false);
    toggleVisibility(gridEl, false);

    try {
      const response = await fetch(`${API_BASE_URL}/servicos`);

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const { dados } = await response.json();

      if (!Array.isArray(dados) || dados.length === 0) {
        throw new Error('Nenhum serviço encontrado.');
      }

      renderServicos(dados);

      toggleVisibility(loadingEl, false);
      toggleVisibility(gridEl, true);

    } catch (erro) {
      console.error('Erro ao carregar serviços:', erro.message);
      toggleVisibility(loadingEl, false);
      toggleVisibility(errorEl, true);
      // Fallback: renderiza dados estáticos caso a API esteja offline
      renderServicosFallback();
      toggleVisibility(errorEl, false);
      toggleVisibility(gridEl, true);
    }
  }

  /**
   * Renderiza os cards de serviços no grid
   * @param {Array} servicos
   */
  function renderServicos(servicos) {
    gridEl.innerHTML = '';

    servicos.forEach((servico, index) => {
      const card = criarCardServico(servico, index);
      gridEl.appendChild(card);
    });
  }

  /**
   * Cria o elemento de card para um serviço
   * @param {Object} servico
   * @param {number} index
   * @returns {HTMLElement}
   */
  function criarCardServico(servico, index) {
    const card = document.createElement('article');
    card.className = 'servico-card';
    card.setAttribute('role', 'listitem');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Serviço: ${servico.titulo}. Clique para ver mais detalhes.`);
    card.style.animationDelay = `${index * 80}ms`;

    const iconeSVG = SERVICO_ICONS[servico.id] || ICON_DEFAULT;

    card.innerHTML = `
      <div class="servico-card__icon" aria-hidden="true">${iconeSVG}</div>
      <h3 class="servico-card__titulo">${escapeHTML(servico.titulo)}</h3>
      <p class="servico-card__desc">${escapeHTML(servico.descricao_curta)}</p>
      <span class="servico-card__cta">
        Ver detalhes
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </span>
    `;

    // Click e teclado para abrir modal
    card.addEventListener('click', () => abrirModal(servico));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        abrirModal(servico);
      }
    });

    return card;
  }

  /** Dados estáticos de fallback quando a API não está disponível */
  function renderServicosFallback() {
    const servicosFallback = [
      { id: 1, titulo: 'Instalações Elétricas', descricao_curta: 'Projetos e execução de instalações elétricas industriais e comerciais com segurança e conformidade às normas ABNT NBR 5410.', descricao_longa: 'Realizamos projetos e execução completa de instalações elétricas para ambientes industriais e comerciais, garantindo conformidade com as normas ABNT NBR 5410 e NR-10.' },
      { id: 2, titulo: 'Controle e Automação', descricao_curta: 'Soluções de automação industrial com integração de sensores, atuadores e sistemas de controle para maximizar a produtividade.', descricao_longa: 'Desenvolvemos soluções personalizadas de automação industrial, integrando sensores, atuadores, inversores de frequência e sistemas SCADA.' },
      { id: 3, titulo: 'Montagem de Painéis', descricao_curta: 'Fabricação e montagem de painéis elétricos de comando, distribuição e automação, com qualidade e precisão técnica.', descricao_longa: 'Fabricamos e montamos painéis elétricos de todos os tipos seguindo as normas IEC e NBR, com documentação técnica completa.' },
      { id: 4, titulo: 'Projetos Elétricos', descricao_curta: 'Elaboração de projetos elétricos industriais detalhados, com memoriais descritivos, diagramas e conformidade normativa.', descricao_longa: 'Elaboramos projetos elétricos completos utilizando software especializado (AutoCAD Electrical, EPLAN) para garantir precisão nos desenhos técnicos.' },
      { id: 5, titulo: 'Manutenção em Geral', descricao_curta: 'Serviços de manutenção preventiva e corretiva em sistemas elétricos e equipamentos industriais para evitar paradas não programadas.', descricao_longa: 'Oferecemos manutenção preventiva e corretiva completa em sistemas elétricos industriais, com análise termográfica e inspeções periódicas.' },
      { id: 6, titulo: 'Programação CLPs e IHMs', descricao_curta: 'Programação e configuração de CLPs (Siemens, Allen-Bradley, WEG) e IHMs para automação e supervisão de processos industriais.', descricao_longa: 'Programamos CLPs/PLCs e IHMs das principais marcas: Siemens, Allen-Bradley, WEG e Schneider Electric, em Ladder, FBD, STL e SCL.' },
    ];
    renderServicos(servicosFallback);
  }

  carregarServicos();
})();

// ============================================================
//  4. MODAL DE SERVIÇOS
// ============================================================

(function initModal() {
  const overlay      = $('#modal-overlay');
  const closeBtns    = [$('#modal-close'), $('#modal-fechar-btn')];
  const modalTitulo  = $('#modal-titulo');
  const modalDesc    = $('#modal-descricao');
  const modalIcon    = $('#modal-icon');

  if (!overlay) return;

  /** Abre o modal com os dados do serviço */
  window.abrirModal = function (servico) {
    modalTitulo.textContent = servico.titulo;
    modalDesc.textContent   = servico.descricao_longa || servico.descricao_curta;
    modalIcon.innerHTML     = SERVICO_ICONS[servico.id] || ICON_DEFAULT;

    overlay.classList.remove('hidden');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Foco para acessibilidade
    setTimeout(() => {
      const closeBtn = $('#modal-close');
      if (closeBtn) closeBtn.focus();
    }, 50);
  };

  /** Fecha o modal */
  function fecharModal() {
    overlay.classList.add('hidden');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  closeBtns.forEach(btn => btn && btn.addEventListener('click', fecharModal));

  // Fecha ao clicar fora do modal
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) fecharModal();
  });

  // Fecha com ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !overlay.classList.contains('hidden')) {
      fecharModal();
    }
  });
})();

// ============================================================
//  5. MÁSCARA DE TELEFONE
// ============================================================

(function initMascaraTelefone() {
  const input = $('#telefone');
  if (!input) return;

  input.addEventListener('input', (e) => {
    let valor = e.target.value.replace(/\D/g, ''); // Remove tudo que não é dígito
    let formatado = '';

    if (valor.length === 0) {
      formatado = '';
    } else if (valor.length <= 2) {
      formatado = `(${valor}`;
    } else if (valor.length <= 6) {
      formatado = `(${valor.slice(0,2)}) ${valor.slice(2)}`;
    } else if (valor.length <= 10) {
      formatado = `(${valor.slice(0,2)}) ${valor.slice(2,6)}-${valor.slice(6)}`;
    } else {
      // Celular com 9 dígitos: (11) 99999-9999
      formatado = `(${valor.slice(0,2)}) ${valor.slice(2,7)}-${valor.slice(7,11)}`;
    }

    e.target.value = formatado;
  });
})();

// ============================================================
//  6. FORMULÁRIO DE CONTATO
// ============================================================

(function initFormulario() {
  const form      = $('#contato-form');
  const btnEnviar = $('#btn-enviar');
  const feedback  = $('#form-feedback');

  if (!form) return;

  // --- Validações ---
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validarCampo(campo, erroId, validacoes) {
    const erroEl = $(`#${erroId}`);
    const valor  = campo.value.trim();
    let mensagem = '';

    for (const validacao of validacoes) {
      if (!validacao.teste(valor)) {
        mensagem = validacao.mensagem;
        break;
      }
    }

    if (erroEl) erroEl.textContent = mensagem;
    campo.classList.toggle('invalid', mensagem !== '');

    return mensagem === '';
  }

  function validarFormulario() {
    const nomeValido = validarCampo($('#nome'), 'erro-nome', [
      { teste: v => v.length > 0, mensagem: 'Por favor, informe seu nome.' },
      { teste: v => v.length >= 3, mensagem: 'O nome deve ter pelo menos 3 caracteres.' },
    ]);

    const emailValido = validarCampo($('#email'), 'erro-email', [
      { teste: v => v.length > 0, mensagem: 'Por favor, informe seu e-mail.' },
      { teste: v => regexEmail.test(v), mensagem: 'Informe um endereço de e-mail válido.' },
    ]);

    const mensagemValida = validarCampo($('#mensagem'), 'erro-mensagem', [
      { teste: v => v.length > 0, mensagem: 'Por favor, escreva sua mensagem.' },
      { teste: v => v.length >= 10, mensagem: 'A mensagem deve ter pelo menos 10 caracteres.' },
    ]);

    return nomeValido && emailValido && mensagemValida;
  }

  // Validação em tempo real (ao sair do campo)
  [
    { id: '#nome',     erroId: 'erro-nome',     validacoes: [{ teste: v => v.length >= 3, mensagem: 'Nome muito curto.' }] },
    { id: '#email',    erroId: 'erro-email',     validacoes: [{ teste: v => !v || regexEmail.test(v), mensagem: 'E-mail inválido.' }] },
    { id: '#mensagem', erroId: 'erro-mensagem',  validacoes: [{ teste: v => !v || v.length >= 10, mensagem: 'Mensagem muito curta.' }] },
  ].forEach(({ id, erroId, validacoes }) => {
    const campo = $(id);
    if (campo) {
      campo.addEventListener('blur', () => {
        if (campo.value.trim()) validarCampo(campo, erroId, validacoes);
      });
      campo.addEventListener('input', () => {
        // Remove erro ao digitar novamente
        const erroEl = $(`#${erroId}`);
        if (erroEl) erroEl.textContent = '';
        campo.classList.remove('invalid');
      });
    }
  });

  // --- Envio do formulário ---
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    // Estado de carregamento
    setLoadingState(true);
    ocultarFeedback();

    const payload = {
      nome:     $('#nome').value.trim(),
      email:    $('#email').value.trim(),
      telefone: $('#telefone').value.trim() || null,
      assunto:  $('#assunto').value.trim()  || null,
      mensagem: $('#mensagem').value.trim(),
    };

    try {
      const response = await fetch(`${API_BASE_URL}/contatos`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.sucesso) {
        throw new Error(data.mensagem || `Erro ${response.status}`);
      }

      // Sucesso
      exibirFeedback(
        `✓ ${data.mensagem || 'Mensagem enviada com sucesso! Entraremos em contato em breve.'}`,
        'success'
      );
      form.reset();

    } catch (erro) {
      console.error('Erro ao enviar contato:', erro.message);
      exibirFeedback(
        `⚠ Não foi possível enviar sua mensagem: ${erro.message}. Tente pelo WhatsApp.`,
        'error'
      );
    } finally {
      setLoadingState(false);
    }
  });

  /** Alterna o estado de carregamento do botão */
  function setLoadingState(loading) {
    btnEnviar.disabled = loading;
    btnEnviar.classList.toggle('btn--loading', loading);
    const btnText = btnEnviar.querySelector('.btn__text');
    if (btnText) btnText.textContent = loading ? 'Enviando...' : 'Enviar Mensagem';
  }

  /** Exibe feedback de sucesso ou erro */
  function exibirFeedback(mensagem, tipo) {
    if (!feedback) return;
    feedback.textContent = mensagem;
    feedback.className = `form__feedback ${tipo}`;
    feedback.classList.remove('hidden');
    feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /** Oculta o feedback */
  function ocultarFeedback() {
    if (!feedback) return;
    feedback.className = 'form__feedback hidden';
    feedback.textContent = '';
  }
})();

// ============================================================
//  7. SCROLL SUAVE PARA LINKS ÂNCORA
// ============================================================

(function initSmoothScroll() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const targetId = link.getAttribute('href').slice(1);
    const target   = document.getElementById(targetId);

    if (target) {
      e.preventDefault();
      const headerHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - headerHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
})();

// ============================================================
//  8. UTILITÁRIO: Escape de HTML (segurança)
// ============================================================

/**
 * Escapa caracteres especiais para evitar XSS
 * @param {string} str
 * @returns {string}
 */
function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
