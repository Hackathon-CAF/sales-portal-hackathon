# Sales Portal

Este é um sistema completo de **portal de vendas**, com **autenticação via cookies HttpOnly**, dividido em **frontend (React + TypeScript)** e **backend (Node.js + Express + Prisma)**.

## Tecnologias Utilizadas

### **Backend**
- Node.js + Express  
- Prisma ORM  
- JWT (HttpOnly cookies)  
- PostgreSQL (ou outro banco configurado)  

### **Frontend**
- React + TypeScript  
- React Router DOM  
- Context API (AuthContext)  
- Bootstrap / CSS  

---

## Pré-requisitos

Antes de começar, você precisa ter instalado:
- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [npm](https://www.npmjs.com/) (ou [yarn](https://yarnpkg.com/))
- [Git](https://git-scm.com/)
- Banco de dados configurado (ex: PostgreSQL)

---

## Clonando o Repositório


```
# Clone o projeto
git clone https://github.com/Hackathon-CAF/sales-portal-hackathon.git
```
```
# Entre na pasta do projeto
cd sales-portal-hackathon
```

## Configuração do Backend

```
# Entre na pasta do backend
cd backend

# Instale as dependências
npm install

# Configure o arquivo .env
cp .env.example .env
```
#### Edite o [.env](.sales-portal/backend/.env.example) com suas credenciais:
```
DATABASE_URL="postgresql://username:password@localhost:5432/database_name?schema=public"
JWT_SECRET="super_secret_password"
NODE_ENV="production"
PORT="..."
CLIENT_URL="https://site-permitido.com" ou "http://localhost:PORTA_DO_SERVIDOR"
ADMIN_EMAIL="..."
ADMIN_PASSWORD="..."
API_DASHBOARD_KEY="dashboard_super_secret_key"
```
#### Gere as tabelas no banco de dados:
```
npx prisma migrate dev
```
#### E inicie o servidor backend:
```
npx prisma migrate dev
```
#### O backend rodará em:
```
http://localhost:3000
```

---

## Configuração do Frontend
```
# Volte para a raiz e vá para o frontend
cd ../frontend

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```
#### O frontend rodará em:
```
http://localhost:5173
```

---

## Configuração do DashBoard
```
# Volte para a raiz e vá para o dashboard
cd ../dashboard

# Instale as dependências
pip install requests pandas plotly streamlit python-dotenv

# Inicie o server do streamlit
streamlit run dashboard.py

```
## Observação:
#### Em caso de erro ao usar o python, substituir pelo python3
```
# Instale as dependências
python3 -m pip install requests pandas plotly streamlit python-dotenv

# Inicie o server do streamlit
python3 -m streamlit run dashboard.py

```
#### O dashboard rodará em:
```
http://localhost:8501
```


