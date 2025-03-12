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
  -d '{"type": "deposit", "destination": "300", "amount": 0.1}')

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