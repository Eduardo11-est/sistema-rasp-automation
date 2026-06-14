/**
 * ============================================================
 *  orcamento.js — Lógica do Formulário de Orçamento
 *  Rasp Automação — Uso Interno
 * ============================================================
 */
'use strict';

const API = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000/api'
  : '/api';

// ── Elementos ─────────────────────────────────────────────
const form        = document.getElementById('orcamento-form');
const tbodyItens  = document.getElementById('itens-tbody');
const totalEl     = document.getElementById('grand-total');
const numOrcEl    = document.getElementById('num-orc-display');
const inputNumOrc = document.getElementById('numero');
const btnAddItem  = document.getElementById('btn-add-item');
const btnSalvar   = document.getElementById('btn-salvar');
const btnImprimir = document.getElementById('btn-imprimir');
const feedbackEl  = document.getElementById('feedback');

// ── Número do Orçamento ───────────────────────────────────
function gerarNumeroOrcamento() {
  const ano = new Date().getFullYear();
  const seq = String(Date.now()).slice(-5);
  return `ORC-${ano}-${seq}`;
}

const numGerado = gerarNumeroOrcamento();
inputNumOrc.value   = numGerado;
numOrcEl.textContent = numGerado;

// Data de hoje
const hoje = new Date().toISOString().split('T')[0];
document.getElementById('data-orcamento').value = hoje;

// ── Itens ─────────────────────────────────────────────────
let itemCounter = 0;

function formatBRL(val) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
}

function parseBRL(str) {
  return parseFloat(String(str).replace(/[^\d,]/g, '').replace(',', '.')) || 0;
}

function recalcularTotais() {
  let grand = 0;

  document.querySelectorAll('.item-row').forEach(row => {
    const qty   = parseFloat(row.querySelector('.inp-qty').value)   || 0;
    const unit  = parseBRL(row.querySelector('.inp-unit').value);
    const total = qty * unit;
    grand += total;
    row.querySelector('.inp-total').value = formatBRL(total);
  });

  totalEl.textContent = formatBRL(grand);
}

function formatarMoeda(input) {
  const raw = input.value.replace(/\D/g, '');
  const num = parseInt(raw || '0', 10) / 100;
  input.value = formatBRL(num);
}

function criarLinhaItem() {
  itemCounter++;
  const tr = document.createElement('tr');
  tr.className = 'item-row';
  tr.dataset.id = itemCounter;

  tr.innerHTML = `
    <td class="col-desc">
      <input type="text" class="inp-desc" placeholder="Descreva o serviço ou material..." required />
    </td>
    <td class="col-qty">
      <input type="number" class="inp-qty" value="1" min="0.01" step="0.01" />
    </td>
    <td class="col-unit">
      <input type="text" class="inp-unit" placeholder="R$ 0,00" inputmode="numeric" />
    </td>
    <td class="col-total">
      <input type="text" class="inp-total" value="R$ 0,00" readonly />
    </td>
    <td class="col-action">
      <button type="button" class="btn-remove-item" title="Remover item" aria-label="Remover este item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    </td>
  `;

  // Eventos
  tr.querySelector('.inp-qty').addEventListener('input', recalcularTotais);
  tr.querySelector('.inp-unit').addEventListener('input', function() {
    formatarMoeda(this);
    recalcularTotais();
  });
  tr.querySelector('.inp-unit').addEventListener('blur', function() {
    formatarMoeda(this);
    recalcularTotais();
  });
  tr.querySelector('.btn-remove-item').addEventListener('click', () => {
    if (document.querySelectorAll('.item-row').length > 1) {
      tr.remove();
      recalcularTotais();
    } else {
      tr.querySelector('.inp-desc').value = '';
      tr.querySelector('.inp-qty').value  = '1';
      tr.querySelector('.inp-unit').value  = '';
      tr.querySelector('.inp-total').value = 'R$ 0,00';
      recalcularTotais();
    }
  });

  return tr;
}

// Adiciona a primeira linha automaticamente
tbodyItens.appendChild(criarLinhaItem());

// Botão "+ Adicionar Item"
btnAddItem.addEventListener('click', () => {
  const tr = criarLinhaItem();
  tbodyItens.appendChild(tr);
  tr.querySelector('.inp-desc').focus();
});

// ── Salvar Orçamento ──────────────────────────────────────
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  ocultarFeedback();

  // Coleta os itens
  const itens = [];
  let valido = true;

  document.querySelectorAll('.item-row').forEach(row => {
    const desc = row.querySelector('.inp-desc').value.trim();
    const qty  = parseFloat(row.querySelector('.inp-qty').value) || 0;
    const unit = parseBRL(row.querySelector('.inp-unit').value);

    if (!desc) {
      row.querySelector('.inp-desc').focus();
      valido = false;
      return;
    }

    itens.push({ descricao: desc, quantidade: qty, valor_unitario: unit });
  });

  if (!valido) {
    exibirFeedback('⚠ Preencha a descrição de todos os itens.', 'error');
    return;
  }

  if (itens.length === 0) {
    exibirFeedback('⚠ Adicione pelo menos um item ao orçamento.', 'error');
    return;
  }

  // Monta payload
  const payload = {
    numero:          document.getElementById('numero').value.trim(),
    cliente_nome:    document.getElementById('cliente-nome').value.trim(),
    cliente_empresa: document.getElementById('cliente-empresa').value.trim() || null,
    cliente_telefone:document.getElementById('cliente-telefone').value.trim() || null,
    cliente_email:   document.getElementById('cliente-email').value.trim() || null,
    data_validade:   document.getElementById('validade').value || null,
    condicao_pagto:  document.getElementById('cond-pagto').value.trim() || null,
    observacoes:     document.getElementById('observacoes').value.trim() || null,
    itens,
  };

  setLoading(true);

  try {
    const res = await fetch(`${API}/orcamentos`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok || !data.sucesso) throw new Error(data.mensagem || `Erro ${res.status}`);

    exibirFeedback(`✓ Orçamento ${payload.numero} salvo com sucesso!`, 'success');

  } catch (err) {
    exibirFeedback(`⚠ Erro ao salvar: ${err.message}`, 'error');
  } finally {
    setLoading(false);
  }
});

// ── Imprimir ──────────────────────────────────────────────
btnImprimir.addEventListener('click', () => {
  // Preenche cabeçalho de impressão
  document.getElementById('print-num').textContent     = inputNumOrc.value;
  document.getElementById('print-data').textContent    = new Date().toLocaleDateString('pt-BR');
  document.getElementById('print-cliente').textContent = document.getElementById('cliente-nome').value || '—';
  document.getElementById('print-total').textContent   = totalEl.textContent;
  window.print();
});

// ── Helpers ───────────────────────────────────────────────
function setLoading(loading) {
  btnSalvar.disabled = loading;
  btnSalvar.classList.toggle('btn--loading', loading);
  btnSalvar.querySelector('span').textContent = loading ? 'Salvando...' : 'Salvar Orçamento';
}

function exibirFeedback(msg, tipo) {
  feedbackEl.textContent = msg;
  feedbackEl.className   = `feedback ${tipo}`;
  feedbackEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function ocultarFeedback() {
  feedbackEl.className = 'feedback';
  feedbackEl.textContent = '';
}

// ── Máscara de Telefone ───────────────────────────────────
document.getElementById('cliente-telefone').addEventListener('input', function() {
  let v = this.value.replace(/\D/g, '');
  if (v.length <= 2)        this.value = v.length ? `(${v}` : '';
  else if (v.length <= 6)   this.value = `(${v.slice(0,2)}) ${v.slice(2)}`;
  else if (v.length <= 10)  this.value = `(${v.slice(0,2)}) ${v.slice(2,6)}-${v.slice(6)}`;
  else                      this.value = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7,11)}`;
});
