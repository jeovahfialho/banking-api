# API Bancária - Backend

API RESTful em Node.js para um sistema bancário que suporta autenticação, consulta de saldo, depósitos, saques e transferências entre contas.

## Funcionalidades

- Autenticação via JWT
- Consulta de saldo de contas
- Depósito em contas (cria conta se não existir)
- Saque de contas existentes
- Transferências entre contas
- Reset do sistema

## Requisitos

- Node.js v14 ou superior
- npm ou yarn

## Instalação

1. Clone o repositório:
   ```bash
   git clone <repositório> banking-api
   cd banking-api
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Crie um arquivo `.env` baseado no `.env.example`:
   ```bash
   cp .env.example .env
   ```
   
   Configure as variáveis de ambiente:
   ```
   NODE_ENV=development
   PORT=3000
   JWT_SECRET=seu_jwt_secret_aqui
   JWT_EXPIRES_IN=1h
   DB_TYPE=memory
   ```

## Execução

### Modo de Desenvolvimento
```bash
npm run dev
```

### Modo de Produção
```bash
npm start
```

### Testes
```bash
npm test
```

## Banco de Dados

Esta implementação usa um banco de dados em memória para simplificar a demonstração. Os dados são armazenados apenas durante a execução do servidor e são perdidos ao reiniciar.

### Migrando para Banco de Dados Persistente

Para implementar persistência real:

1. Instale as dependências do banco de dados:
   ```bash
   # Para MongoDB
   npm install mongoose
   
   # Para PostgreSQL
   npm install pg sequelize
   ```

2. Modifique `src/infrastructure/database.js` para conectar ao banco de dados escolhido

3. Atualize os repositórios em `src/infrastructure/repositories.js`

4. Configure a conexão no arquivo `.env`
   ```
   DB_TYPE=mongodb
   MONGO_URI=mongodb://localhost:27017/banking
   ```

## Estrutura do Projeto

```
src/
├── controllers/               # Controladores da aplicação
│   ├── accountController.js   # Controlador de operações de conta
│   └── authController.js      # Controlador de autenticação
│
├── middleware/                # Middlewares Express
│   ├── authenticateJWT.js     # Middleware de autenticação
│   └── errorHandler.js        # Tratamento global de erros
│
├── services/                  # Camada de serviços (lógica de negócio)
│   └── accountService.js      # Serviço de operações bancárias
│
├── infrastructure/            # Infraestrutura do sistema
│   ├── database.js            # Configuração do banco de dados
│   ├── repositories.js        # Implementação dos repositórios
│   └── eventBus.js            # Gerenciador de eventos
│
├── utils/                     # Utilitários
│   └── errors.js              # Classes de erro personalizadas
│
├── config/                    # Configurações da aplicação
│   └── index.js               # Exporta configurações
│
├── routes/                    # Definição de rotas
│   └── index.js               # Configuração de todas as rotas
│
└── index.js                   # Ponto de entrada da aplicação
```

## API Endpoints

### Autenticação

#### Login
- **URL**: `/login`
- **Método**: `POST`
- **Corpo da Requisição**:
  ```json
  {
    "username": "admin",
    "pass": "admin"
  }
  ```
- **Resposta de Sucesso**:
  - **Código**: 200 OK
  - **Corpo**:
    ```json
    {
      "token": "<jwt_token>"
    }
    ```
- **Resposta de Erro**:
  - **Código**: 403 Forbidden

### Operações Bancárias

**Nota**: Todas as operações abaixo exigem autenticação. Inclua o token JWT no header `Authorization: Bearer <jwt_token>`.

#### Consultar Saldo
- **URL**: `/balance?account_id={id}`
- **Método**: `GET`
- **Parâmetros de URL**:
  - `account_id`: ID da conta a consultar
- **Resposta de Sucesso**:
  - **Código**: 200 OK
  - **Corpo**:
    ```json
    {
      "balance": 20
    }
    ```
- **Resposta de Erro**:
  - **Código**: 404 Not Found (conta não existe)

#### Criar Conta / Depósito
- **URL**: `/event`
- **Método**: `POST`
- **Corpo da Requisição**:
  ```json
  {
    "type": "deposit",
    "destination": "100",
    "amount": 10
  }
  ```
- **Resposta de Sucesso**:
  - **Código**: 201 Created
  - **Corpo**:
    ```json
    {
      "destination": {
        "id": "100",
        "balance": 10
      }
    }
    ```

#### Saque
- **URL**: `/event`
- **Método**: `POST`
- **Corpo da Requisição**:
  ```json
  {
    "type": "withdraw",
    "origin": "100",
    "amount": 5
  }
  ```
- **Resposta de Sucesso**:
  - **Código**: 201 Created
  - **Corpo**:
    ```json
    {
      "origin": {
        "id": "100",
        "balance": 15
      }
    }
    ```
- **Respostas de Erro**:
  - **Código**: 404 Not Found (conta não existe)
  - **Código**: 400 Bad Request
    ```json
    {
      "error": "Insufficient funds"
    }
    ```

#### Transferência
- **URL**: `/event`
- **Método**: `POST`
- **Corpo da Requisição**:
  ```json
  {
    "type": "transfer",
    "origin": "100",
    "amount": 15,
    "destination": "300"
  }
  ```
- **Resposta de Sucesso**:
  - **Código**: 201 Created
  - **Corpo**:
    ```json
    {
      "origin": {
        "id": "100",
        "balance": 0
      },
      "destination": {
        "id": "300",
        "balance": 15
      }
    }
    ```
- **Respostas de Erro**:
  - **Código**: 404 Not Found (conta de origem não existe)
  - **Código**: 400 Bad Request
    ```json
    {
      "error": "Insufficient funds"
    }
    ```

#### Reset do Sistema
- **URL**: `/reset`
- **Método**: `POST`
- **Resposta de Sucesso**:
  - **Código**: 200 OK

## Exemplos de Uso com curl

### Login
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "pass": "admin"}'
```

### Consulta de Saldo
```bash
curl -X GET "http://localhost:3000/balance?account_id=100" \
  -H "Authorization: Bearer <seu_token_jwt>"
```

### Depósito
```bash
curl -X POST http://localhost:3000/event \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <seu_token_jwt>" \
  -d '{"type": "deposit", "destination": "100", "amount": 10}'
```

### Saque
```bash
curl -X POST http://localhost:3000/event \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <seu_token_jwt>" \
  -d '{"type": "withdraw", "origin": "100", "amount": 5}'
```

### Transferência
```bash
curl -X POST http://localhost:3000/event \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <seu_token_jwt>" \
  -d '{"type": "transfer", "origin": "100", "amount": 15, "destination": "300"}'
```

### Reset do Sistema
```bash
curl -X POST http://localhost:3000/reset \
  -H "Authorization: Bearer <seu_token_jwt>"
```

## Teste Automatizado

Para executar uma sequência completa de testes:

```bash
#!/bin/bash

# Login e obter token
TOKEN=$(curl -s -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "pass": "admin"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo "Token: $TOKEN"

# Reset do sistema
echo -e "\nReset do sistema:"
curl -s -X POST http://localhost:3000/reset \
  -H "Authorization: Bearer $TOKEN"

# Criar conta com depósito
echo -e "\nDepósito inicial na conta 100:"
curl -s -X POST http://localhost:3000/event \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"type": "deposit", "destination": "100", "amount": 50}'

# Verificar saldo
echo -e "\nSaldo da conta 100:"
curl -s -X GET "http://localhost:3000/balance?account_id=100" \
  -H "Authorization: Bearer $TOKEN"

# Saque
echo -e "\nSaque de 20 da conta 100:"
curl -s -X POST http://localhost:3000/event \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"type": "withdraw", "origin": "100", "amount": 20}'

# Verificar saldo após saque
echo -e "\nSaldo da conta 100 após saque:"
curl -s -X GET "http://localhost:3000/balance?account_id=100" \
  -H "Authorization: Bearer $TOKEN"

# Criar segunda conta
echo -e "\nCriando conta 200:"
curl -s -X POST http://localhost:3000/event \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"type": "deposit", "destination": "200", "amount": 10}'

# Transferência
echo -e "\nTransferência de 15 da conta 100 para 200:"
curl -s -X POST http://localhost:3000/event \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"type": "transfer", "origin": "100", "amount": 15, "destination": "200"}'

# Verificar saldos finais
echo -e "\nSaldo final da conta 100:"
curl -s -X GET "http://localhost:3000/balance?account_id=100" \
  -H "Authorization: Bearer $TOKEN"

echo -e "\nSaldo final da conta 200:"
curl -s -X GET "http://localhost:3000/balance?account_id=200" \
  -H "Authorization: Bearer $TOKEN"
```

## Considerações de Segurança

- Tokens JWT são configurados para expirar após o tempo definido em `JWT_EXPIRES_IN`
- Todas as entradas são validadas antes do processamento
- Middlewares de autenticação protegem rotas sensíveis
- Sistema de tratamento de erros evita vazamento de informações sensíveis

## Limitações da Implementação Atual

- Banco de dados em memória (não persistente)
- Sem suporte a usuários múltiplos (apenas admin fixo)
- Sem sistema completo de auditoria e log de transações
- Sem validação avançada de entradas

## Próximos Passos

- Implementar persistência com MongoDB
- Adicionar sistema de usuários com roles (admin, cliente)
- Melhorar sistema de auditoria e logging
- Implementar validações mais robustas
- Adicionar documentação OpenAPI/Swagger
