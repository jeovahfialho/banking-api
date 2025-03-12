const request = require('supertest');
const app = require('../../src/index');

/**
 * Cria uma conta com saldo inicial
 * @param {string} token - Token JWT de autenticação
 * @param {string} accountId - ID da conta
 * @param {number} amount - Saldo inicial
 */
async function createAccount(token, accountId, amount) {
  const response = await request(app)
    .post('/event')
    .set('Authorization', `Bearer ${token}`)
    .send({
      type: 'deposit',
      destination: accountId,
      amount: amount
    });
  
  return response;
}

/**
 * Realiza um saque
 * @param {string} token - Token JWT de autenticação
 * @param {string} accountId - ID da conta
 * @param {number} amount - Valor a sacar
 */
async function withdraw(token, accountId, amount) {
  const response = await request(app)
    .post('/event')
    .set('Authorization', `Bearer ${token}`)
    .send({
      type: 'withdraw',
      origin: accountId,
      amount: amount
    });
  
  return response;
}

/**
 * Realiza uma transferência
 * @param {string} token - Token JWT de autenticação
 * @param {string} originId - ID da conta de origem
 * @param {string} destinationId - ID da conta de destino
 * @param {number} amount - Valor a transferir
 */
async function transfer(token, originId, destinationId, amount) {
  const response = await request(app)
    .post('/event')
    .set('Authorization', `Bearer ${token}`)
    .send({
      type: 'transfer',
      origin: originId,
      destination: destinationId,
      amount: amount
    });
  
  return response;
}

/**
 * Consulta o saldo de uma conta
 * @param {string} token - Token JWT de autenticação
 * @param {string} accountId - ID da conta
 */
async function getBalance(token, accountId) {
  const response = await request(app)
    .get(`/balance?account_id=${accountId}`)
    .set('Authorization', `Bearer ${token}`);
  
  return response;
}

/**
 * Reseta o sistema
 * @param {string} token - Token JWT de autenticação
 */
async function resetSystem(token) {
  const response = await request(app)
    .post('/reset')
    .set('Authorization', `Bearer ${token}`);
  
  return response;
}

module.exports = {
  createAccount,
  withdraw,
  transfer,
  getBalance,
  resetSystem
};