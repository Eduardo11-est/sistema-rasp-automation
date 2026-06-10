const servicos = [
  {
    id: 1,
    titulo: 'Instalações Elétricas',
    descricao_curta: 'Projetos e execução de instalações elétricas industriais e comerciais com segurança e conformidade às normas ABNT NBR 5410.',
    descricao_longa: 'Realizamos projetos e execução completa de instalações elétricas para ambientes industriais e comerciais. Nossa equipe técnica garante conformidade rigorosa com as normas ABNT NBR 5410 e NR-10, desde o cabeamento estruturado até quadros de distribuição, dimensionamento de condutores e aterramento. Trabalhamos com tomadas industriais, calhas, eletrocalhas, eletrodutos e todos os materiais de primeira linha para garantir segurança, durabilidade e eficiência energética em toda a instalação.',
    imagem_url: null,
  },
  {
    id: 2,
    titulo: 'Controle e Automação',
    descricao_curta: 'Soluções de automação industrial com integração de sensores, atuadores e sistemas de controle para maximizar a produtividade.',
    descricao_longa: 'Desenvolvemos soluções personalizadas de automação industrial, integrando sensores, atuadores, inversores de frequência e sistemas SCADA. Utilizamos tecnologias de ponta para automatizar processos produtivos, reduzir custos operacionais e aumentar a produtividade da sua planta industrial. Nossas soluções incluem automação de linhas de produção, sistemas de controle de processos contínuos, integração de máquinas e equipamentos, além de monitoramento remoto em tempo real via supervisórios modernos.',
    imagem_url: null,
  },
  {
    id: 3,
    titulo: 'Montagem de Painéis',
    descricao_curta: 'Fabricação e montagem de painéis elétricos de comando, distribuição e automação, com qualidade e precisão técnica.',
    descricao_longa: 'Fabricamos e montamos painéis elétricos de todos os tipos: painéis de comando, painéis de distribuição (CCM), painéis de automação, painéis de força e painéis de supervisão. Todo o processo segue as normas IEC e NBR, com documentação técnica completa (esquemas elétricos, memorial descritivo e certificados). Utilizamos componentes de marcas renomadas como Schneider Electric, Siemens, WEG e ABB, garantindo confiabilidade e vida útil longa para o equipamento.',
    imagem_url: null,
  },
  {
    id: 4,
    titulo: 'Projetos Elétricos',
    descricao_curta: 'Elaboração de projetos elétricos industriais detalhados, com memoriais descritivos, diagramas e conformidade normativa.',
    descricao_longa: 'Elaboramos projetos elétricos completos para indústrias, galpões, prédios comerciais e instalações especiais. Nossos projetos incluem planta baixa com pontos elétricos, diagrama unifilar, diagrama multifilar, dimensionamento de cabos e proteções, projeto de aterramento, laudo de conformidade e ART (Anotação de Responsabilidade Técnica). Utilizamos software especializado (AutoCAD Electrical, EPLAN) para garantir precisão e clareza nos desenhos técnicos, facilitando a execução e futuras manutenções.',
    imagem_url: null,
  },
  {
    id: 5,
    titulo: 'Manutenção em Geral',
    descricao_curta: 'Serviços de manutenção preventiva e corretiva em sistemas elétricos e equipamentos industriais para evitar paradas não programadas.',
    descricao_longa: 'Oferecemos serviços completos de manutenção preventiva e corretiva em sistemas elétricos industriais, motores, transformadores, quadros elétricos e equipamentos de automação. Nossa abordagem preventiva inclui cronograma de inspeções periódicas, análise termográfica, verificação de conexões e componentes, garantindo que sua planta opere sem interrupções inesperadas. Em casos de falha, nossa equipe técnica atua com rapidez na identificação e solução do problema, minimizando o tempo de parada da produção.',
    imagem_url: null,
  },
  {
    id: 6,
    titulo: 'Programação CLPs e IHMs',
    descricao_curta: 'Programação e configuração de CLPs (Siemens, Allen-Bradley, WEG) e IHMs para automação e supervisão de processos industriais.',
    descricao_longa: 'Realizamos programação e configuração de Controladores Lógicos Programáveis (CLPs/PLCs) e Interfaces Homem-Máquina (IHMs/HMIs) das principais marcas do mercado: Siemens (S7-300, S7-1200, S7-1500), Allen-Bradley (MicroLogix, CompactLogix), WEG (TPW-04), Schneider Electric (Modicon) e outras. Desenvolvemos lógicas de controle em Ladder, FBD, STL e SCL, além de telas de operação intuitivas nas IHMs. Também realizamos retrofit de sistemas legados, migrando programações antigas para plataformas modernas com toda a documentação técnica.',
    imagem_url: null,
  },
];

let proxIdContato = 1;
const contatos = [];

function listarServicos() {
  return servicos;
}

function buscarServicoPorId(id) {
  return servicos.find(s => s.id === id) || null;
}

function criarContato({ nome, email, telefone, assunto, mensagem }) {
  const contato = {
    id: proxIdContato++,
    nome: nome.trim(),
    email: email.trim().toLowerCase(),
    telefone: telefone ? telefone.trim() : null,
    assunto: assunto ? assunto.trim() : null,
    mensagem: mensagem.trim(),
    criado_em: new Date().toISOString(),
  };
  contatos.unshift(contato);
  return contato;
}

function listarContatos() {
  return contatos;
}

// ── Orçamentos (fallback em memória) ────────────────────────
let proxIdOrcamento = 1;
const orcamentos = [];

function criarOrcamento({ numero, cliente_nome, cliente_empresa, cliente_telefone, cliente_email, data_validade, condicao_pagto, observacoes, itens, total }) {
  const orc = {
    id: proxIdOrcamento++,
    numero,
    cliente_nome: cliente_nome.trim(),
    cliente_empresa: cliente_empresa || null,
    cliente_telefone: cliente_telefone || null,
    cliente_email: cliente_email || null,
    data_validade: data_validade || null,
    condicao_pagto: condicao_pagto || null,
    observacoes: observacoes || null,
    itens: itens.map((item, i) => ({
      id: i + 1,
      descricao: item.descricao,
      quantidade: parseFloat(item.quantidade) || 1,
      valor_unitario: parseFloat(item.valor_unitario) || 0,
      valor_total: (parseFloat(item.quantidade) || 1) * (parseFloat(item.valor_unitario) || 0),
    })),
    total: parseFloat(total) || 0,
    status: 'pendente',
    criado_em: new Date().toISOString(),
  };
  orcamentos.unshift(orc);
  return orc;
}

function listarOrcamentos() {
  return orcamentos.map(({ itens, ...rest }) => rest);
}

function buscarOrcamentoPorId(id) {
  return orcamentos.find(o => o.id === id) || null;
}

module.exports = { listarServicos, buscarServicoPorId, criarContato, listarContatos, criarOrcamento, listarOrcamentos, buscarOrcamentoPorId };
