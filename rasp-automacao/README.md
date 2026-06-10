# 🔌 Rasp Automação — Site Institucional

> Sistema web moderno para a **Rasp Automação** — empresa especializada em automação industrial, instalações elétricas, montagem de painéis e projetos elétricos.

---

## 🏗️ Arquitetura

```
rasp-automacao/
├── backend/        # API REST — Node.js + Express + PostgreSQL
├── frontend/       # UI estática — HTML5 + CSS3 + JavaScript Vanilla
└── database/       # Scripts SQL para PostgreSQL
```

---

## ⚙️ Configuração e Instalação

### Pré-requisitos

- [Node.js](https://nodejs.org/) v18+
- [PostgreSQL](https://www.postgresql.org/) v14+ (local ou [Neon.tech](https://neon.tech) gratuito)

### 1. Banco de Dados

**Opção A — PostgreSQL local:**
```bash
# Crie o banco
psql -U postgres -c "CREATE DATABASE rasp_automacao;"

# Execute o schema
psql -U postgres -d rasp_automacao -f database/schema.sql
```

**Opção B — Neon.tech (nuvem gratuita):**
1. Acesse [neon.tech](https://neon.tech) e crie uma conta
2. Crie um projeto e copie a **Connection String**
3. Execute o `schema.sql` pelo console do Neon

### 2. Backend

```bash
cd backend

# Copie e configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais do banco

# Instale as dependências
npm install

# Inicie em modo desenvolvimento
npm run dev

# Ou em produção
npm start
```

O servidor estará disponível em: **http://localhost:3000**

### 3. Frontend

Abra o arquivo `frontend/index.html` diretamente no navegador.

> **Dica:** Para uma melhor experiência em desenvolvimento, use a extensão [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) do VS Code.

---

## 🌐 Endpoints da API

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET`  | `/api/health` | Verifica status do servidor |
| `GET`  | `/api/servicos` | Lista todos os serviços |
| `GET`  | `/api/servicos/:id` | Detalhe de um serviço |
| `POST` | `/api/contatos` | Salva contato/lead |
| `GET`  | `/api/contatos` | Lista contatos recebidos |

### Exemplo de uso

```bash
# Testar se a API está online
curl http://localhost:3000/api/health

# Listar serviços
curl http://localhost:3000/api/servicos

# Enviar contato
curl -X POST http://localhost:3000/api/contatos \
  -H "Content-Type: application/json" \
  -d '{"nome":"João Silva","email":"joao@email.com","mensagem":"Gostaria de um orçamento."}'
```

---

## 📱 Contato

- **WhatsApp:** [(11) 96398-7438](https://wa.me/5511963987438)
- **E-mail:** contato@raspautomacao.com.br

---

© Rasp Automação — Todos os direitos reservados.
