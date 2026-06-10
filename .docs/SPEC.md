Você é um Engenheiro de Software Full-Stack Sênior e Especialista em UI/UX. Seu objetivo é refatorar e modernizar o site institucional da "Rasp Automação" (empresa especializada em automação industrial, montagem de painéis e instalações elétricas), transformando o design legado em uma aplicação web moderna, extremamente rápida, responsiva e totalmente conectada a um banco de dados relacional.

# OBJETIVO PRINCIPAL
Recriar o site institucional da Rasp Automação mantendo a essência da marca (identidade visual, slogan/proposta de valor, logotipo e serviços), mas elevando a experiência do usuário (UX) e a infraestrutura tecnológica para os padrões atuais do mercado. O site deve deixar de ser apenas uma página estática antiga e passar a ser um sistema dinâmico que gerencia e consome dados de serviços e armazena mensagens de contato diretamente no PostgreSQL.

# DEFINIÇÃO DA ARQUITETURA DO PROJETO
Para garantir a manutenibilidade, o projeto deve seguir uma arquitetura cliente-servidor de responsabilidade única (Desacoplada), organizada dentro de uma estrutura de repositório único (Monorepo clássico). O código deve ser estruturado rigorosamente da seguinte forma:

```text
rasp-automacao/
├── backend/                 # API REST baseada em Node.js e Express
│   ├── config/              # Configurações do sistema (Ex: db.js para conexão com PostgreSQL)
│   ├── controllers/         # Lógica de negócio e manipulação dos dados (servicosController, contatosController)
│   ├── routes/              # Definição dos endpoints da API (api.js ou rotas separadas)
│   ├── .env.example         # Exemplo de variáveis de ambiente (DB_HOST, DB_USER, etc.)
│   └── server.js            # Ponto de entrada (Entrypoint) do servidor backend
│
└── frontend/                # Interface do Usuário (Client-side) estática e otimizada
    ├── css/
    │   └── style.css        # Estilização moderna e variáveis CSS
    ├── js/
    │   └── main.js          # Consumo de API (fetch), manipulação do DOM (modais) e validações
    └── index.html           # HTML5 semântico e estrutural

# STACK TECNOLÓGICA OBRIGATÓRIA

Frontend: HTML5 semântico, CSS3 moderno (utilizando obrigatoriamente Flexbox, CSS Grid, variáveis CSS para gerenciamento de cores e transições suaves) e JavaScript Vanilla (ES6+ puro, sem frameworks como React ou Vue).

Backend: Node.js com Express (para construir uma API REST simples que serve de ponte entre o frontend e o banco de dados).

Banco de Dados: PostgreSQL (para persistência e consistência dos dados de contatos recebidos e listagem dinâmica de serviços).

Conexão Node-PostgreSQL: Utilizar o driver nativo pg (node-postgres) ou o Query Builder Knex.js/Sequelize.

# DIRETRIZES ESTÉTICAS E UI/UX (A Essência da Marca)

Paleta de Cores: Deve ser extraída e baseada estritamente no logotipo original. Use o Vermelho (#C1272D ou tom similar da logo) como cor de destaque (Primary/Accent) para botões, links ativos e detalhes. Combine com tons modernos de cinza escuro, grafite e branco para fundos e textos, garantindo excelente contraste e legibilidade.

Logotipo: O logotipo original ("Rasp automação" com o detalhe do plugue de tomada vermelho saindo da letra 'p') deve ser mantido em destaque no canto superior esquerdo do Header.

Tipografia: Substitua as fontes antigas por fontes web modernas, limpas e profissionais importadas do Google Fonts (sugestão: 'Inter', 'Roboto' ou 'Montserrat').

Layout Geral e Identidade Visual Original:

Elimine o visual datado em blocos rígidos, bordas grossas e cantos quadrados sem harmonia. Aplique um layout fluido, limpo e com bastante respiro (white space).

Hero Section: O banner antigo com fotos de maquinários industriais deve virar uma "Hero Section" de alto impacto. Use o texto original do topo "Automação de Máquinas e Processos" como o título principal (H1/Slogan de destaque), acompanhado de uma imagem industrial moderna em alta definição e um botão de Call to Action (Ex: "Fale Conosco").

Metáfora Visual: O site antigo trazia a imagem conceitual de uma lâmpada contendo um braço robótico industrial (simbolizando ideias e automação). Tente reinterpretar essa essência visual de forma moderna através de iconografia ou na seção "Quem Somos".

# ARQUITETURA E MODELAGEM DE DADOS (POSTGRESQL)
Você deve gerar o script SQL para estruturar o banco de dados PostgreSQL com duas tabelas principais:

Tabela servicos:

Campos: id (Serial/PK), titulo (Varchar), descricao_curta (Text), descricao_longa (Text), imagem_url (Varchar).

Comportamento: A API Node.js deve expor uma rota GET /api/servicos. O JavaScript do Frontend consumirá essa rota via fetch() para renderizar os cards dinamicamente na tela.

Tabela contatos:

Campos: id (Serial/PK), nome (Varchar), email (Varchar), telefone (Varchar), assunto (Varchar), mensagem (Text), criado_em (Timestamp por padrão NOW()).

Comportamento: Quando o formulário de contato for enviado, o frontend fará um fetch() com método POST /api/contatos para salvar o lead diretamente no banco de dados.

# FUNCIONALIDADES E ESTRUTURA DA PÁGINA (FRONTEND)

1. Header (Cabeçalho de Navegação)
Logotipo oficial alinhado à esquerda.

Menu de navegação fixo no topo ao rolar a página (Sticky Navigation) com links para transição suave (Anchor links) entre as seções: Quem Somos, Serviços, Contato.

À direita, um botão de destaque em verde para o WhatsApp com o número de contato original: 11 96398-7438 (omita o texto antigo "vivo" para priorizar o design limpo), utilizando um ícone moderno em vetor/SVG.

2. Seção "Quem Somos"
Bloco de texto elegante focado na descrição institucional original: Empresa especializada nas áreas de instalações elétricas, automação industrial, montagem de painéis elétricos e projetos industriais.

3. Seção "Nossos Serviços" (Cards Dinâmicos e Interativos)
Substitua o grid antigo de imagens com molduras laranjas por um grid moderno (CSS Grid) que renderiza dinamicamente os 6 serviços originais da marca:

*Instalações Elétricas
*Controle e Automação
*Montagem de Painéis
*Projetos Elétricos
*Manutenção em Geral
*Programação CLPs e IHMs

Comportamento Interativo (JavaScript): Mantendo a premissa original de "selecionar a imagem para ver a descrição", adicione interatividade moderna. Cada card deve ter um efeito visual de 'hover' (ex: leve elevação e sombra). Ao clicar no card de um serviço, o JavaScript deve disparar a abertura de um Modal (janela flutuante) moderno e responsivo que exibe a descricao_longa detalhada vinda do banco de dados para aquele serviço.

4. Seção de Contato (Formulário Avançado)
Layout moderno dividido em duas colunas: de um lado o formulário limpo (com os campos originais da imagem: Nome, E-mail, Telefone, Assunto e Mensagem), do outro as informações diretas de contato da empresa (Telefone: 11 96398-7438 e E-mail: contato@raspautomacao.com.br).

Validação estrita via JavaScript no Frontend: checagem de campos vazios, validação de estrutura de e-mail e aplicação de uma máscara dinâmica para o input de Telefone/WhatsApp.

Ao clicar no botão "Enviar", o JavaScript deve prevenir o comportamento padrão, simular visualmente um estado de carregamento ("Enviando..."), disparar a requisição para a API do backend e exibir um feedback de sucesso limpo ("Mensagem enviada com sucesso!") após o retorno positivo do banco de dados.

5. Footer (Rodapé)
Texto de direitos autorais padrão ("© Rasp Automação - Todos os direitos reservados"), mas com o ano gerado de forma dinâmica pelo JavaScript atualizando automaticamente (new Date().getFullYear()).

# ENTREGÁVEIS ESPERADOS

Código conforme a Arquitetura Proposta: Geração do código respeitando rigorosamente a divisão de pastas descrita na seção de arquitetura (Frontend e Backend separados).

Script SQL (schema.sql): Código pronto para criação das tabelas no PostgreSQL, incluindo os comandos de INSERT iniciais para os 6. serviços mencionados acima, deixando o banco populado.

Código do Servidor Backend: Node.js/Express estruturado em rotas e controllers, com tratamento de erros, CORS habilitado para se comunicar com o frontend e conexão pronta com o banco de dados.

Design 100% Responsivo: Código CSS aplicando a filosofia Mobile-First, garantindo que o site fique impecável em smartphones, tablets e monitores desktop de alta resolução.