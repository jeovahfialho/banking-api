# API Bancária - Backend

API RESTful em Node.js para um sistema bancário que suporta autenticação, consulta de saldo, depósitos, saques e transferências entre contas.

## Funcionalidades

- ✅ Autenticação via JWT
- ✅ Consulta de saldo de contas
- ✅ Depósito em contas (cria conta se não existir)
- ✅ Saque de contas existentes
- ✅ Transferências entre contas
- ✅ Reset do sistema
- ✅ Sistema de eventos para auditoria

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

## Script de Teste Completo

Use este script para testar todos os endpoints da API conforme a especificação.

Salve o conteúdo abaixo em um arquivo chamado `test_complete.sh`:

```bash
#!/bin/bash

# Define cores para melhor visualização
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"
TOKEN=""

# Função para exibir resultados de testes
test_case() {
  echo -e "\n${YELLOW}==== $1 ====${NC}"
}

# Função para verificar se o resultado está de acordo com o esperado
check_result() {
  if [ $1 -eq $2 ]; then
    echo -e "${GREEN}✓ Status code: $1${NC}"
  else
    echo -e "${RED}✗ Status code: $1 (esperado: $2)${NC}"
  fi
  echo "$3"
}

# 1.1 Login com credenciais corretas
test_case "1.1 Login com credenciais corretas"
LOGIN_RESULT=$(curl -s -w "%{http_code}" -X POST $BASE_URL/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "pass": "admin"}')

STATUS_CODE=${LOGIN_RESULT: -3}
RESPONSE=${LOGIN_RESULT%???}

check_result $STATUS_CODE 200 "$RESPONSE"

# Extrair token JWT
TOKEN=$(echo $RESPONSE | grep -o '"token":"[^"]*"' | sed 's/"token":"//;s/"$//')
echo -e "Token JWT: ${TOKEN:0:20}...(truncado)"

# 1.2 Tentativa de acesso sem autenticação
test_case "1.2 Tentativa de acesso sem autenticação"
RESULT=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/balance?account_id=100")

STATUS_CODE=${RESULT: -3}
RESPONSE=${RESULT%???}

check_result $STATUS_CODE 401 "$RESPONSE"

# 1.3 Login com credenciais inválidas
test_case "1.3 Login com credenciais inválidas"
RESULT=$(curl -s -w "%{http_code}" -X POST $BASE_URL/login \
  -H "Content-Type: application/json" \
  -d '{"username": "invalid", "pass": "invalid"}')

STATUS_CODE=${RESULT: -3}
RESPONSE=${RESULT%???}

check_result $STATUS_CODE 403 "$RESPONSE"

# 2.1 Reset do sistema
test_case "2.1 Reset do sistema"
RESULT=$(curl -s -w "%{http_code}" -X POST $BASE_URL/reset \
  -H "Authorization: Bearer $TOKEN")

STATUS_CODE=${RESULT: -3}
RESPONSE=${RESULT%???}

check_result $STATUS_CODE 200 "$RESPONSE"

# 3.1 Consultar saldo de conta inexistente
test_case "3.1 Consultar saldo de conta inexistente"
RESULT=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/balance?account_id=1234" \
  -H "Authorization: Bearer $TOKEN")

STATUS_CODE=${RESULT: -3}
RESPONSE=${RESULT%???}

check_result $STATUS_CODE 404 "$RESPONSE"

# 4.1 Criar conta com saldo inicial
test_case "4.1 Criar conta com saldo inicial"
RESULT=$(curl -s -w "%{http_code}" -X POST $BASE_URL/event \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"type": "deposit", "destination": "100", "amount": 10}')

STATUS_CODE=${RESULT: -3}
RESPONSE=${RESULT%???}

check_result $STATUS_CODE 201 "$RESPONSE"

# 4.2 Depósito em conta existente
test_case "4.2 Depósito em conta existente"
RESULT=$(curl -s -w "%{http_code}" -X POST $BASE_URL/event \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"type": "deposit", "destination": "100", "amount": 10}')

STATUS_CODE=${RESULT: -3}
RESPONSE=${RESULT%???}

check_result $STATUS_CODE 201 "$RESPONSE"

# 3.2 Consultar saldo de conta existente
test_case "3.2 Consultar saldo de conta existente"
RESULT=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/balance?account_id=100" \
  -H "Authorization: Bearer $TOKEN")

STATUS_CODE=${RESULT: -3}
RESPONSE=${RESULT%???}

check_result $STATUS_CODE 200 "$RESPONSE"

# 5.1 Saque de conta inexistente
test_case "5.1 Saque de conta inexistente"
RESULT=$(curl -s -w "%{http_code}" -X POST $BASE_URL/event \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"type": "withdraw", "origin": "200", "amount": 10}')

STATUS_CODE=${RESULT: -3}
RESPONSE=${RESULT%???}

check_result $STATUS_CODE 404 "$RESPONSE"

# 5.2 Saque de conta existente
test_case "5.2 Saque de conta existente"
RESULT=$(curl -s -w "%{http_code}" -X POST $BASE_URL/event \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"type": "withdraw", "origin": "100", "amount": 5}')

STATUS_CODE=${RESULT: -3}
RESPONSE=${RESULT%???}

check_result $STATUS_CODE 201 "$RESPONSE"

# 5.3 Saque com saldo insuficiente
test_case "5.3 Saque com saldo insuficiente"
RESULT=$(curl -s -w "%{http_code}" -X POST $BASE_URL/event \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"type": "withdraw", "origin": "100", "amount": 50}')

STATUS_CODE=${RESULT: -3}
RESPONSE=${RESULT%???}

check_result $STATUS_CODE 400 "$RESPONSE"

# Criar uma segunda conta para transferência
test_case "Criar conta de destino (300) para transferência"
RESULT=$(curl -s -w "%{http_code}" -X POST $BASE_URL/event \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"type": "deposit", "destination": "300", "amount": 0.01}')

STATUS_CODE=${RESULT: -3}
RESPONSE=${RESULT%???}

check_result $STATUS_CODE 201 "$RESPONSE"

# 6.1 Transferência entre contas existentes
test_case "6.1 Transferência entre contas existentes"
RESULT=$(curl -s -w "%{http_code}" -X POST $BASE_URL/event \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"type": "transfer", "origin": "100", "amount": 15, "destination": "300"}')

STATUS_CODE=${RESULT: -3}
RESPONSE=${RESULT%???}

check_result $STATUS_CODE 201 "$RESPONSE"

# 6.2 Transferência com origem inexistente
test_case "6.2 Transferência com origem inexistente"
RESULT=$(curl -s -w "%{http_code}" -X POST $BASE_URL/event \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"type": "transfer", "origin": "200", "amount": 15, "destination": "300"}')

STATUS_CODE=${RESULT: -3}
RESPONSE=${RESULT%???}

check_result $STATUS_CODE 404 "$RESPONSE"

# 6.3 Transferência com saldo insuficiente
test_case "6.3 Transferência com saldo insuficiente"
RESULT=$(curl -s -w "%{http_code}" -X POST $BASE_URL/event \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"type": "transfer", "origin": "100", "amount": 50, "destination": "300"}')

STATUS_CODE=${RESULT: -3}
RESPONSE=${RESULT%???}

check_result $STATUS_CODE 400 "$RESPONSE"

# Verificação final dos saldos
test_case "Verificação final dos saldos"
RESULT=$(curl -s -X GET "$BASE_URL/balance?account_id=100" \
  -H "Authorization: Bearer $TOKEN")
echo "Saldo da conta 100: $RESULT"

RESULT=$(curl -s -X GET "$BASE_URL/balance?account_id=300" \
  -H "Authorization: Bearer $TOKEN")
echo "Saldo da conta 300: $RESULT"

echo -e "\n${GREEN}==== Testes completos! ====${NC}"
```

### Instruções para executar o script de teste:

1. Salve o script em um arquivo chamado `test_complete.sh`
2. Dê permissão de execução:
   ```bash
   chmod +x test_complete.sh
   ```
3. Execute o script:
   ```bash
   ./test_complete.sh
   ```

## Script de Teste Simples

Se preferir um script mais simples, você pode usar o seguinte:

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

## Banco de Dados

Esta implementação usa um banco de dados em memória para simplificar a demonstração. Os dados são armazenados apenas durante a execução do servidor e são perdidos ao reiniciar.

### Migrando para Banco de Dados Persistente

Para implementar persistência real:

1. **MongoDB**:
   ```javascript
   // Exemplo de conexão com MongoDB
   const mongoose = require('mongoose');
   mongoose.connect(process.env.MONGO_URI);
   
   // Definir schema para conta
   const accountSchema = new mongoose.Schema({
     id: String,
     balance: Number,
     createdAt: { type: Date, default: Date.now },
     updatedAt: { type: Date, default: Date.now }
   });
   
   const Account = mongoose.model('Account', accountSchema);
   ```

2. **PostgreSQL/MySQL**:
   ```javascript
   // Exemplo com Sequelize
   const { Sequelize, DataTypes } = require('sequelize');
   const sequelize = new Sequelize(process.env.DB_URI);
   
   const Account = sequelize.define('Account', {
     id: {
       type: DataTypes.STRING,
       primaryKey: true
     },
     balance: DataTypes.DECIMAL(10, 2),
     createdAt: DataTypes.DATE,
     updatedAt: DataTypes.DATE
   });
   ```

## Considerações de Segurança

- Tokens JWT são configurados para expirar após o tempo definido em `JWT_EXPIRES_IN`
- Todas as entradas são validadas antes do processamento
- Middlewares de autenticação protegem rotas sensíveis
- Sistema de tratamento de erros evita vazamento de informações sensíveis

## Implementações Futuras

- Persistência de dados em MongoDB ou PostgreSQL
- Sistema completo de usuários e autenticação
- Registro detalhado de transações (transaction log)
- Documentação OpenAPI/Swagger
- Testes automatizados com Jest
