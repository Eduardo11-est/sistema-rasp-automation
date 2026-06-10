-- ============================================================
--  Rasp Automação — Schema do Banco de Dados PostgreSQL
--  Execute este arquivo para criar e popular o banco inicial
-- ============================================================

-- Garante um reset limpo em ambiente de desenvolvimento
DROP TABLE IF EXISTS contatos;
DROP TABLE IF EXISTS servicos;

-- ============================================================
--  TABELA: servicos
-- ============================================================
CREATE TABLE servicos (
    id               SERIAL PRIMARY KEY,
    titulo           VARCHAR(150)  NOT NULL,
    descricao_curta  TEXT          NOT NULL,
    descricao_longa  TEXT          NOT NULL,
    imagem_url       VARCHAR(255)  DEFAULT NULL,
    criado_em        TIMESTAMP     DEFAULT NOW()
);

-- ============================================================
--  TABELA: contatos
-- ============================================================
CREATE TABLE contatos (
    id         SERIAL PRIMARY KEY,
    nome       VARCHAR(150)  NOT NULL,
    email      VARCHAR(200)  NOT NULL,
    telefone   VARCHAR(20),
    assunto    VARCHAR(200),
    mensagem   TEXT          NOT NULL,
    criado_em  TIMESTAMP     DEFAULT NOW()
);

-- ============================================================
--  DADOS INICIAIS — 6 Serviços da Rasp Automação
-- ============================================================
INSERT INTO servicos (titulo, descricao_curta, descricao_longa, imagem_url) VALUES
(
    'Instalações Elétricas',
    'Projetos e execução de instalações elétricas industriais e comerciais com segurança e conformidade às normas ABNT NBR 5410.',
    'Realizamos projetos e execução completa de instalações elétricas para ambientes industriais e comerciais. Nossa equipe técnica garante conformidade rigorosa com as normas ABNT NBR 5410 e NR-10, desde o cabeamento estruturado até quadros de distribuição, dimensionamento de condutores e aterramento. Trabalhamos com tomadas industriais, calhas, eletrocalhas, eletrodutos e todos os materiais de primeira linha para garantir segurança, durabilidade e eficiência energética em toda a instalação.',
    NULL
),
(
    'Controle e Automação',
    'Soluções de automação industrial com integração de sensores, atuadores e sistemas de controle para maximizar a produtividade.',
    'Desenvolvemos soluções personalizadas de automação industrial, integrando sensores, atuadores, inversores de frequência e sistemas SCADA. Utilizamos tecnologias de ponta para automatizar processos produtivos, reduzir custos operacionais e aumentar a produtividade da sua planta industrial. Nossas soluções incluem automação de linhas de produção, sistemas de controle de processos contínuos, integração de máquinas e equipamentos, além de monitoramento remoto em tempo real via supervisórios modernos.',
    NULL
),
(
    'Montagem de Painéis',
    'Fabricação e montagem de painéis elétricos de comando, distribuição e automação, com qualidade e precisão técnica.',
    'Fabricamos e montamos painéis elétricos de todos os tipos: painéis de comando, painéis de distribuição (CCM), painéis de automação, painéis de força e painéis de supervisão. Todo o processo segue as normas IEC e NBR, com documentação técnica completa (esquemas elétricos, memorial descritivo e certificados). Utilizamos componentes de marcas renomadas como Schneider Electric, Siemens, WEG e ABB, garantindo confiabilidade e vida útil longa para o equipamento.',
    NULL
),
(
    'Projetos Elétricos',
    'Elaboração de projetos elétricos industriais detalhados, com memoriais descritivos, diagramas e conformidade normativa.',
    'Elaboramos projetos elétricos completos para indústrias, galpões, prédios comerciais e instalações especiais. Nossos projetos incluem planta baixa com pontos elétricos, diagrama unifilar, diagrama multifilar, dimensionamento de cabos e proteções, projeto de aterramento, laudo de conformidade e ART (Anotação de Responsabilidade Técnica). Utilizamos software especializado (AutoCAD Electrical, EPLAN) para garantir precisão e clareza nos desenhos técnicos, facilitando a execução e futuras manutenções.',
    NULL
),
(
    'Manutenção em Geral',
    'Serviços de manutenção preventiva e corretiva em sistemas elétricos e equipamentos industriais para evitar paradas não programadas.',
    'Oferecemos serviços completos de manutenção preventiva e corretiva em sistemas elétricos industriais, motores, transformadores, quadros elétricos e equipamentos de automação. Nossa abordagem preventiva inclui cronograma de inspeções periódicas, análise termográfica, verificação de conexões e componentes, garantindo que sua planta opere sem interrupções inesperadas. Em casos de falha, nossa equipe técnica atua com rapidez na identificação e solução do problema, minimizando o tempo de parada da produção.',
    NULL
),
(
    'Programação CLPs e IHMs',
    'Programação e configuração de CLPs (Siemens, Allen-Bradley, WEG) e IHMs para automação e supervisão de processos industriais.',
    'Realizamos programação e configuração de Controladores Lógicos Programáveis (CLPs/PLCs) e Interfaces Homem-Máquina (IHMs/HMIs) das principais marcas do mercado: Siemens (S7-300, S7-1200, S7-1500), Allen-Bradley (MicroLogix, CompactLogix), WEG (TPW-04), Schneider Electric (Modicon) e outras. Desenvolvemos lógicas de controle em Ladder, FBD, STL e SCL, além de telas de operação intuitivas nas IHMs. Também realizamos retrofit de sistemas legados, migrando programações antigas para plataformas modernas com toda a documentação técnica.',
    NULL
);

-- ============================================================
--  TABELA: orcamentos
-- ============================================================
CREATE TABLE orcamentos (
    id                SERIAL PRIMARY KEY,
    numero            VARCHAR(30)   NOT NULL UNIQUE,
    cliente_nome      VARCHAR(150)  NOT NULL,
    cliente_empresa   VARCHAR(150),
    cliente_telefone  VARCHAR(20),
    cliente_email     VARCHAR(200),
    data_validade     DATE,
    condicao_pagto    VARCHAR(100),
    observacoes       TEXT,
    total             NUMERIC(12,2) DEFAULT 0,
    status            VARCHAR(30)   DEFAULT 'pendente',
    criado_em         TIMESTAMP     DEFAULT NOW()
);

-- ============================================================
--  TABELA: orcamento_itens
-- ============================================================
CREATE TABLE orcamento_itens (
    id               SERIAL PRIMARY KEY,
    orcamento_id     INTEGER       NOT NULL REFERENCES orcamentos(id) ON DELETE CASCADE,
    descricao        TEXT          NOT NULL,
    quantidade       NUMERIC(10,2) DEFAULT 1,
    valor_unitario   NUMERIC(12,2) NOT NULL,
    valor_total      NUMERIC(12,2) GENERATED ALWAYS AS (quantidade * valor_unitario) STORED
);
