# 🍕 Trackomidas - Sistema de Delivery de Restaurantes

> Plataforma completa de delivery com gestão de restaurantes, cardápios, pedidos e avaliações.

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/node-18.x-green)

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Arquitetura](#arquitetura)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Executando o Projeto](#executando-o-projeto)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [API Endpoints](#api-endpoints)
- [Modelos de Dados](#modelos-de-dados)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Deploy](#deploy)
- [Testes](#testes)
- [Contribuindo](#contribuindo)
- [Licença](#licença)
- [Contato](#contato)

---

## 🎯 Sobre o Projeto

O **Trackomidas** é uma plataforma web completa de delivery que conecta restaurantes e clientes, oferecendo uma experiência moderna e intuitiva para pedidos online.

### Problema que Resolve

- Facilita a gestão de múltiplos restaurantes e seus cardápios
- Permite que clientes façam pedidos de forma rápida e segura
- Sistema de avaliações para melhorar a qualidade do serviço
- Gestão de entregas com cálculo de frete automático

### Diferenciais

✨ Interface moderna e responsiva  
🚀 Performance otimizada  
📱 Design mobile-first  
🔐 Autenticação segura com JWT  
⭐ Sistema de avaliações em tempo real  

---

## ⚡ Funcionalidades

### Para Clientes
- [x] Navegação por lista de restaurantes
- [x] Visualização de cardápios com fotos
- [x] Sistema de busca e filtros
- [x] Carrinho de compras
- [x] Acompanhamento de pedidos em tempo real
- [x] Avaliação de restaurantes e pedidos
- [x] Histórico de pedidos

### Para Restaurantes
- [x] Gestão completa do perfil
- [x] Cadastro de múltiplos endereços
- [x] Gerenciamento de cardápio (categorias e produtos)
- [x] Upload de imagens (Google Drive integration)
- [x] Configuração de taxas de entrega
- [x] Dashboard com estatísticas
- [x] Gerenciamento de pedidos

### Para Administradores
- [x] Painel administrativo completo
- [x] Gerenciamento de usuários
- [x] Moderação de avaliações
- [x] Relatórios e analytics

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React** 18.x - Biblioteca JavaScript
- **TypeScript** - Tipagem estática
- **React Router** - Roteamento SPA
- **Tailwind CSS** - Estilização
- **Lucide React** - Ícones
- **Axios** - Requisições HTTP
- **Zustand** - Gerenciamento de estado

### Backend
- **Node.js** 18.x - Runtime JavaScript
- **Express** - Framework web
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticação
- **Zod** - Validação de dados
- **Bcrypt** - Hash de senhas

### DevOps e Ferramentas
- **Git** - Controle de versão
- **Google Drive API** - Armazenamento de imagens
- **ESLint** - Linting
- **Prettier** - Formatação de código

---

## 🏗️ Arquitetura

```
┌─────────────┐
│   Cliente   │
│  (React)    │
└──────┬──────┘
       │
       │ HTTP/REST
       │
┌──────▼──────┐
│   Backend   │
│  (Express)  │
└──────┬──────┘
       │
       │ Mongoose
       │
┌──────▼──────┐
│   MongoDB   │
└─────────────┘
```

### Padrões de Projeto
- **MVC** - Separação de responsabilidades
- **Repository Pattern** - Abstração de acesso a dados
- **Middleware Pattern** - Autenticação e autorização
- **RESTful API** - Arquitetura de API

---

## 📦 Pré-requisitos

Antes de começar, você precisa ter instalado:

- [Node.js](https://nodejs.org/) v18 ou superior
- [MongoDB](https://www.mongodb.com/) v6 ou superior
- [Git](https://git-scm.com/)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)

---

## 🚀 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/trackomidas.git
cd trackomidas
```

### 2. Instale as dependências

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

---

## ⚙️ Configuração

### Backend

Crie um arquivo `.env` na pasta `backend`:

```env
# Servidor
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/trackomidas

# JWT
JWT_SECRET=sua_chave_secreta_super_segura_aqui
JWT_EXPIRES_IN=7d

# Google Drive (opcional)
GOOGLE_DRIVE_CLIENT_ID=seu_client_id
GOOGLE_DRIVE_CLIENT_SECRET=seu_client_secret
```

### Frontend

Crie um arquivo `.env` na pasta `frontend`:

```env
VITE_API_URL=http://localhost:3000/api
```

---

## ▶️ Executando o Projeto

### Desenvolvimento

**Backend:**
```bash
cd backend
npm run dev
```
Servidor rodando em: `http://localhost:3000`

**Frontend:**
```bash
cd frontend
npm run dev
```
Aplicação rodando em: `http://localhost:5173`

### Produção

**Backend:**
```bash
npm run build
npm start
```

**Frontend:**
```bash
npm run build
npm run preview
```

---

## 📁 Estrutura de Pastas

```
trackomidas/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Lógica de negócio
│   │   ├── models/           # Schemas do MongoDB
│   │   ├── routes/           # Definição de rotas
│   │   ├── middlewares/      # Autenticação, validação
│   │   ├── utils/            # Funções auxiliares
│   │   └── server.ts         # Entrada da aplicação
│   ├── .env                  # Variáveis de ambiente
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Componentes React
│   │   │   ├── shell/        # Layout principal
│   │   │   └── ui/           # Componentes reutilizáveis
│   │   ├── pages/            # Páginas da aplicação
│   │   │   ├── cliente/      # Área do cliente
│   │   │   ├── restaurante/  # Área do restaurante
│   │   │   └── admin/        # Área administrativa
│   │   ├── stores/           # Zustand stores
│   │   ├── lib/              # Utilitários
│   │   ├── types/            # TypeScript types
│   │   └── App.tsx           # Componente raiz
│   ├── .env                  # Variáveis de ambiente
│   └── package.json
│
└── README.md                 # Este arquivo
```

---

## 🔌 API Endpoints

### Autenticação
```http
POST   /api/auth/register     # Registrar novo usuário
POST   /api/auth/login        # Login
GET    /api/auth/me           # Obter usuário atual
```

### Restaurantes
```http
GET    /api/restaurants           # Listar restaurantes (público)
GET    /api/restaurants/:id       # Detalhes de um restaurante
GET    /api/restaurants/me        # Meu restaurante (auth)
PUT    /api/restaurants/me        # Atualizar meu restaurante
POST   /api/restaurants/me/addresses      # Adicionar endereço
PATCH  /api/restaurants/me/addresses/:id  # Atualizar endereço
DELETE /api/restaurants/me/addresses/:id  # Remover endereço
```

### Produtos
```http
GET    /api/products             # Listar produtos
POST   /api/products             # Criar produto
PATCH  /api/products/:id         # Atualizar produto
DELETE /api/products/:id         # Remover produto
```

### Pedidos
```http
GET    /api/orders               # Listar pedidos
POST   /api/orders               # Criar pedido
GET    /api/orders/:id           # Detalhes do pedido
PATCH  /api/orders/:id/status    # Atualizar status
```

### Avaliações
```http
POST   /api/ratings              # Criar avaliação
GET    /api/ratings/:restaurantId # Avaliações de um restaurante
```

> 📘 **Documentação completa da API:** [Swagger/Postman Collection]

---

## 💾 Modelos de Dados

### User
```typescript
{
  _id: ObjectId,
  nome: string,
  email: string,
  senha: string (hash),
  role: 'CLIENTE' | 'RESTAURANTE' | 'ADMIN',
  telefone?: string,
  createdAt: Date,
  updatedAt: Date
}
```

### Restaurant
```typescript
{
  _id: ObjectId,
  owner: ObjectId (ref: User),
  nome: string,
  descricao?: string,
  enderecos: [{
    apelido: string,
    cep: string,
    rua: string,
    numero: string,
    cidade: string,
    uf: string,
    freteFixo: number,
    freteKm: number,
    logoId: string
  }],
  categorias: [{ nome: string }],
  ratingsSum: number,
  ratingsCount: number,
  ordersCount: number,
  createdAt: Date,
  updatedAt: Date
}
```

### Order
```typescript
{
  _id: ObjectId,
  cliente: ObjectId (ref: User),
  restaurante: ObjectId (ref: Restaurant),
  items: [{
    produto: ObjectId (ref: Product),
    quantidade: number,
    preco: number
  }],
  status: 'PENDENTE' | 'CONFIRMADO' | 'EM_PREPARO' | 'SAIU_ENTREGA' | 'ENTREGUE' | 'CANCELADO',
  total: number,
  frete: number,
  endereco: { /* endereço de entrega */ },
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔐 Variáveis de Ambiente

### Backend (`.env`)

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `PORT` | Porta do servidor | `3000` |
| `MONGODB_URI` | String de conexão MongoDB | `mongodb://localhost:27017/trackomidas` |
| `JWT_SECRET` | Chave secreta JWT | `minhaChaveSecreta123` |
| `JWT_EXPIRES_IN` | Tempo de expiração do token | `7d` |

### Frontend (`.env`)

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `VITE_API_URL` | URL da API | `http://localhost:3000/api` |

---

## 🌐 Deploy

### Backend (Render/Railway/Heroku)

1. Configure as variáveis de ambiente
2. Conecte ao MongoDB Atlas
3. Execute o build: `npm run build`
4. Deploy automático via Git

### Frontend (Vercel/Netlify)

1. Configure `VITE_API_URL` para URL de produção
2. Build: `npm run build`
3. Deploy da pasta `dist/`

---

## 🧪 Testes

### Backend
```bash
npm run test
npm run test:watch
npm run test:coverage
```

### Frontend
```bash
npm run test
npm run test:ui
```

---

## 🤝 Contribuindo

Contribuições são sempre bem-vindas!

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

### Padrões de Commit

Utilizamos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Manutenção

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👥 Autores

- **Seu Nome** - *Desenvolvimento* - [GitHub](https://github.com/seu-usuario)

---

## 📞 Contato

- Email: seu.email@example.com
- LinkedIn: [seu-perfil](https://linkedin.com/in/seu-perfil)
- Portfolio: [seu-site.com](https://seu-site.com)

---

## 🙏 Agradecimentos

- Comunidade React
- Time do MongoDB
- Contribuidores open source

---

## 📊 Status do Projeto

- ✅ MVP finalizado
- 🚧 Sistema de notificações (em desenvolvimento)
- 📋 Chat em tempo real (planejado)
- 📋 App mobile (planejado)

---

**Feito com ❤️ por [Seu Nome]**
