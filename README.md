# 🔌 Rasp Automação — Sistema de Automação Industrial e Orçamentos

> Sistema web moderno e integrado para a **Rasp Automação** — empresa líder em automação industrial, instalações elétricas, montagem de painéis e programação de CLPs/IHMs. Este repositório foi totalmente refatorado e preparado com as melhores práticas de desenvolvimento, segurança e DevOps.

---

## 🏗️ Arquitetura do Projeto

O sistema é estruturado como um monorepo desacoplado (Arquitetura Cliente-Servidor de Responsabilidade Única), permitindo manutenibilidade e escalabilidade independente para o Frontend e o Backend:

```text
sistema-rasp-automation/
├── .gitignore               # Configurações globais de exclusão do Git (DevOps)
├── README.md                # Documentação técnica principal (esta página)
└── rasp-automacao/
    ├── backend/             # API REST — Node.js + Express + Supabase Client SDK
    │   ├── config/          # Inicialização do banco (PostgreSQL Pool e Supabase Client)
    │   ├── controllers/     # Regras de negócio (Serviços, Leads de Contato, Orçamentos)
    │   ├── data/            # Armazenamento em memória (Fallback caso o banco esteja offline)
    │   ├── routes/          # Endpoints da API REST
    │   ├── .env.example     # Modelo de variáveis de ambiente seguro para replicação
    │   └── server.js        # Entrypoint do servidor Express
    │
    ├── database/            # Scripts DDL/DML de banco de dados
    │   └── schema.sql       # Schema completo com inserção dos 6 serviços originais
    │
    └── frontend/            # Interface do Usuário (UI) — Vanilla HTML5, CSS3 e JS
        ├── css/             # Folhas de estilo modernas e design responsivo
        ├── js/              # Consumo de APIs, manipulação do DOM e micro-animações
        ├── index.html       # Landing page institucional
        ├── orcamento.html   # Visualização rápida/gestão do orçamento
        └── solicitar-orcamento.html # Formulário dinâmico para solicitações de clientes
```

---

## ⚙️ Funcionalidades Principais

1. **Catálogo Dinâmico de Serviços**: Renderização automática dos serviços cadastrados no banco de dados na página principal, com efeitos hover e visualização detalhada em Modais modernos.
2. **Formulário de Contato Inteligente**: Captura de dados institucionais (Nome, Email, Telefone, Assunto e Mensagem) com máscara dinâmica de WhatsApp e salvamento direto via API.
3. **Mecanismo de Orçamentos do Cliente**: Interface exclusiva (`solicitar-orcamento.html`) onde o cliente final seleciona múltiplos serviços desejados, preenche dados corporativos e envia a solicitação. O sistema gera um código rastreável automático (ex: `REQ-2026-X1Y2Z`).
4. **Resiliência a Falhas (Fallback)**: O backend conta com um mecanismo inteligente em memória. Caso as variáveis do banco não estejam preenchidas ou o servidor do banco fique indisponível, o sistema continua operando no modo em memória para evitar indisponibilidade de serviços (Uptime focado).

---

## 🛡️ Segurança e Configuração (.env)

Em conformidade com as diretrizes do **OWASP**, credenciais sensíveis e URLs foram removidas do código fonte e são configuradas exclusivamente via variáveis de ambiente.

### Passos de Instalação

#### 1. Clonar e Inicializar o Repositório
```bash
git clone https://github.com/Eduardo11-est/sistema-rasp-automation.git
cd sistema-rasp-automation
```

#### 2. Configurar o Backend
Acesse a pasta do backend, instale as dependências de produção e duplique o arquivo `.env.example`:
```bash
cd rasp-automacao/backend
npm install --only=production
cp .env.example .env
```

Edite o seu arquivo `.env` recém-criado com as chaves corretas:
```ini
# Servidor Express
PORT=3000
CORS_ORIGIN=*

# Controle do Banco de Dados (true/false)
USE_DATABASE=true

# Conexão recomendada (Supabase Client SDK)
NEXT_PUBLIC_SUPABASE_URL=https://seu-subdominio.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sua-chave-publica-anon-do-supabase
```

#### 3. Executar o Servidor
```bash
# Modo Produção
npm start

# Modo Desenvolvimento (Recarregamento automático via nodemon)
npm run dev
```
O servidor inicializará em **`http://localhost:3000`**.

#### 4. Frontend
Acesse a pasta `frontend` e abra `index.html` em qualquer navegador. Para desenvolvimento, é recomendado o uso da extensão **Live Server** no VS Code.

---

## 📊 Estrutura de Tabelas (PostgreSQL / Supabase)

O banco de dados é modelado com quatro tabelas principais:

### 1. `servicos`
Armazena as informações dos serviços oferecidos.
*   `id` (Serial/PK)
*   `titulo` (VARCHAR)
*   `descricao_curta` (TEXT)
*   `descricao_longa` (TEXT)
*   `imagem_url` (VARCHAR)

### 2. `contatos`
Armazena as mensagens recebidas na landing page.
*   `id` (Serial/PK)
*   `nome` (VARCHAR)
*   `email` (VARCHAR)
*   `telefone` (VARCHAR)
*   `assunto` (VARCHAR)
*   `mensagem` (TEXT)
*   `criado_em` (TIMESTAMP)

### 3. `orcamentos`
Armazena a folha principal do pedido do orçamento de um cliente.
*   `id` (Serial/PK)
*   `numero` (VARCHAR - Único) — Código rastreável (ex: `REQ-2026-XXXXX`)
*   `cliente_nome` (VARCHAR)
*   `cliente_empresa` (VARCHAR)
*   `cliente_telefone` (VARCHAR)
*   `cliente_email` (VARCHAR)
*   `observacoes` (TEXT)
*   `status` (VARCHAR) — Padrão: `pendente`
*   `criado_em` (TIMESTAMP)

### 4. `orcamento_itens`
Relaciona os múltiplos serviços selecionados a um determinado orçamento.
*   `id` (Serial/PK)
*   `orcamento_id` (FK -> `orcamentos.id` ON DELETE CASCADE)
*   `descricao` (TEXT)
*   `quantidade` (NUMERIC)
*   `valor_unitario` (NUMERIC)
*   `valor_total` (Gerado Automaticamente: `quantidade * valor_unitario`)

---

## 🌐 Endpoints Principais da API REST

A API do backend fornece os seguintes endpoints:

| Método | Endpoint | Descrição | Payload (JSON) |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/health` | Verifica a saúde da conexão e status da API | N/A |
| **GET** | `/api/servicos` | Recupera a lista de serviços ativos | N/A |
| **POST** | `/api/contatos` | Cria um lead de contato no banco de dados | `{"nome", "email", "telefone", "assunto", "mensagem"}` |
| **POST** | `/api/orcamentos` | Registra uma nova solicitação de orçamento e seus itens | `{"numero", "cliente_nome", "cliente_email", "cliente_telefone", "cliente_empresa", "observacoes", "itens": [{"descricao", "quantidade", "valor_unitario"}]}` |

---

## 🛠️ Stack Tecnológica

*   **Frontend**: HTML5 Semântico, CSS3 Flexbox/Grid moderno, JavaScript Vanilla (ES6+).
*   **Backend**: Node.js v18+, Express.js (Roteamento e Servidor REST), CORS.
*   **Banco de Dados**: PostgreSQL com integração `@supabase/supabase-js` Client.
*   **Versionamento**: Git & GitHub.

---
Desenvolvido por **Rasp Automação** &copy; 2026. Todos os direitos reservados.
