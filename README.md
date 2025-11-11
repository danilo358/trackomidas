# 🍕 Trackomidas - Sistema de Delivery de Restaurantes

> Plataforma completa de delivery com gestão de restaurantes, cardápios, pedidos e avaliações.

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/node-18.x-green)

## 🎯 Sobre o Projeto

O **Trackomidas** é uma plataforma web completa de delivery que conecta restaurantes e clientes, oferecendo uma experiência moderna e intuitiva para pedidos online.

### Problema que Resolve

- Facilita a gestão de múltiplos restaurantes e seus cardápios
- Permite que clientes façam pedidos de forma rápida e segura
- Sistema de avaliações para melhorar a qualidade do serviço
- Gestão de entregas com cálculo de frete automático

### Diferenciais

✨ Interface moderna e responsiva  
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
- [x] Gerenciamento de cardápio (categorias e produtos)
- [x] Upload de imagens (Google Drive integration)
- [x] Configuração de taxas de entrega
- [x] Gerenciamento de pedidos

### Para Administradores
- [x] Painel administrativo completo

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
PORT=3333

# MongoDB
MONGODB_URI=mongodb://localhost:27017/trackomidas

# JWT
JWT_SECRET=sua_chave_secreta_super_segura_aqui

#CORS ORIGIN/ FRONT END
CORS_ORIGIN=http://localhost:5173
```

### Frontend

Crie um arquivo `.env` na pasta `frontend`:

```env
VITE_API_URL=http://localhost:3333
VITE_MAPBOX_TOKEN=Seu_Token_MapBox
```

---

## ▶️ Executando o Projeto

### Desenvolvimento

**Backend:**
```bash
cd backend
npm run dev
```
Servidor rodando em: `http://localhost:3333`

**Frontend:**
```bash
cd frontend
npm run dev
```
Aplicação rodando em: `http://localhost:5173`

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
│   │   ├── config/           # Configuração do .env
│   │   ├── realtime/         # Configuração do socket.io
│   │   ├── types/            # Configuração do Express para Usuarios
│   │   └── server.ts         # Entrada da aplicação
│   ├── .env                  # Variáveis de ambiente
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── auth/             # Configuração das Roles dos Users
│   │   ├── components/       # Componentes React
│   │   │   ├── maps/         # Componente do Mapa do MAPBOX
│   │   │   └── shell/        # Layout principal
│   │   ├── pages/            # Páginas da aplicação
│   │   │   ├── auth/         # Área de Login
│   │   │   ├── client/       # Área do cliente
│   │   │   ├── driver/       # Área do entregador
│   │   │   ├── restaurants/  # Área do restaurante
│   │   │   └── admin/        # Área administrativa
│   │   ├── stores/           # Zustand stores
│   │   ├── lib/              # Utilitários
│   │   ├── index.css         # Configuração do tailwind
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
POST   /register     # Registrar novo usuário
POST   /login        # Login
POST   /logout
GET    /me           # Obter usuário atual
```

### Restaurantes
```http
GET    /restaurants/me                        # Meu restaurante (auth)
PUT    /restaurants/me                        # Atualizar meu restaurante
POST   /restaurants/me/addresses              # Adicionar endereço
PATCH  /restaurants/me/addresses/:id          # Atualizar endereço
DELETE /restaurants/me/addresses/:id          # Remover endereço
GET    /restaurants/:id                       # Restaurante para publico
```

### Categorias
```http
POST   /restaurans/me/categories             # Listar categorias
PATCH  /restaurans/me/categories/:id         # Atualizar categoria
DELETE /restaurans/me/categories/:id         # Remover categoria
```

### Produtos
```http
GET    /items/me             # Listar produtos
POST   /items/me             # Criar produto
PATCH  /items/me/:id         # Atualizar produto
DELETE /items/me/:id         # Remover produto
```

### Pedidos
```http
GET    /orders/me            # Listar pedidos
POST   /orders               # Criar pedido
GET    /orders/my            # Detalhes do pedido
PATCH  /orders/:id/next      # Atualizar status
```

### Avaliações
```http
PATCH   /my/:id/rate         # Criar avaliação
GET    /me/reviews           # Avaliações de um restaurante
```

## 💾 Modelos de Dados

### User
```typescript
{
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  senhaHash: { type: String, required: true },
  role: { type: String, enum: ROLES, default: 'CLIENTE' as Role },
  enderecos: [CustomerAddressSchema]
}
```

### Endereço Usuario
```typescript
{
  _id: ObjectId,
  apelido: { type: String, required: true },
  cep: String,
  rua: String,
  numero: String,
  bairro: String,
  cidade: String,
  uf: String,
  complemento: String
}
```

### Restaurant
```typescript
{
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  nome: { type: String, required: true },
  descricao: String,
  // ⚠️ CAMPOS DEPRECADOS - Mantidos por compatibilidade
  ratingAvg: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  // ✅ CAMPOS CORRETOS
  ratingsCount: { type: Number, default: 0 },
  ratingsSum:   { type: Number, default: 0 },
  ordersCount:  { type: Number, default: 0 }, 
  enderecos: [AddressSchema],
  categorias: [CategorySchema]
}
```

### Endereço Restaurante
```typescript
{
  apelido: { type: String, required: true },
  cep: String,
  rua: String,
  numero: String,
  cidade: String,
  uf: String,
  freteFixo: { type: Number, default: 0 },
  freteKm: { type: Number, default: 0 },
  logoId: { type: String, default: '' }
}
```

### Order
```typescript
{
  restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
  cliente:    { type: Schema.Types.ObjectId, ref: 'User', required: false },
  itens:      [{ nome: String, qtd: Number, preco: Number }],
  total:      { type: Number, required: true },
  status:     { type: String, enum: ['AGUARDANDO','EM_PREPARO','PRONTO','EM_ROTA','FECHADO'], default: 'AGUARDANDO' },
  entregador: { type: String },                 // nome exibido
  driverUserId: { type: Schema.Types.ObjectId, ref: 'User' }, // vínculo com o usuário ENTREGADOR
  driverLoc:  { type: DriverLocSchema, default: null },
  dest: {
  lng: { type: Number },
  lat: { type: Number },
  label: { type: String }
  },
  closedAt:  { type: Date, default: null },
  archivedAt:{ type: Date, default: null },
  rating: {
    nota: { type: Number, min: 1, max: 5 },
    comentario: { type: String, default: '' }
    },
    ratedAt: { type: Date, default: null }
}
```

---

## 🔐 Variáveis de Ambiente

### Backend (`.env`)

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `PORT` | Porta do servidor | `3333` |
| `MONGODB_URI` | String de conexão MongoDB | `mongodb://localhost:27017/trackomidas` |
| `JWT_SECRET` | Chave secreta JWT | `minhaChaveSecreta123` |
| `CORS_ORIGIN` | Origem do FrontEnd | `http://localhost:5173` |
### Frontend (`.env`)

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `VITE_API_URL` | URL da API | `http://localhost:3333` |
| `VITE_MAPBOX_TOKEN` | Token da API do MAPBOX | `pk.ey....` |

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


## 👥 Autores

- **Danilo Silva** - *Desenvolvimento* - [GitHub](https://github.com/danilo358)

---

## 📞 Contato

- Email: danilops2006@hotmail.com
- LinkedIn: [Danilo Silva](www.linkedin.com/in/danilopaulosilva)

---


## 📊 Status do Projeto

- ✅ MVP finalizado
- 🚧 Sistema de notificações (em desenvolvimento)
- 📋 Chat em tempo real (planejado)
- 📋 App mobile (planejado)

---

**Feito com ❤️ por Danilo Silva**
