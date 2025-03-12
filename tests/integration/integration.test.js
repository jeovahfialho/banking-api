const request = require('supertest');
const app = require('../../src/index');
const { 
  createAccount, 
  withdraw, 
  transfer, 
  getBalance, 
  resetSystem 
} = require('../utils/test-helpers');

// Teste de integração - fluxo completo do sistema
describe('Fluxo Completo do Sistema', () => {
  let token;

  // Obter token para testes
  beforeAll(async () => {
    const response = await request(app)
      .post('/login')
      .send({
        username: 'admin',
        pass: 'admin'
      });
    
    token = response.body.token;
  });

  // Resetar sistema antes dos testes
  beforeEach(async () => {
    await resetSystem(token);
  });

  test('Fluxo completo com múltiplas operações', async () => {
    // 1. Criar contas iniciais
    const account1Response = await createAccount(token, '1001', 100);
    expect(account1Response.statusCode).toBe(201);
    expect(account1Response.body.destination.balance).toBe(100);

    const account2Response = await createAccount(token, '1002', 20);
    expect(account2Response.statusCode).toBe(201);
    expect(account2Response.body.destination.balance).toBe(20);

    // 2. Verificar saldos iniciais
    const balance1Response = await getBalance(token, '1001');
    expect(balance1Response.statusCode).toBe(200);
    expect(balance1Response.body.balance).toBe(100);

    const balance2Response = await getBalance(token, '1002');
    expect(balance2Response.statusCode).toBe(200);
    expect(balance2Response.body.balance).toBe(20);

    // 3. Fazer um saque da conta 1
    const withdrawResponse = await withdraw(token, '1001', 30);
    expect(withdrawResponse.statusCode).toBe(201);
    expect(withdrawResponse.body.origin.balance).toBe(70);

    // 4. Transferir da conta 1 para conta 2
    const transferResponse = await transfer(token, '1001', '1002', 50);
    expect(transferResponse.statusCode).toBe(201);
    expect(transferResponse.body.origin.balance).toBe(20);
    expect(transferResponse.body.destination.balance).toBe(70);

    // 5. Verificar saldo final das contas
    const finalBalance1Response = await getBalance(token, '1001');
    expect(finalBalance1Response.body.balance).toBe(20);

    const finalBalance2Response = await getBalance(token, '1002');
    expect(finalBalance2Response.body.balance).toBe(70);

    // 6. Tentar saque com saldo insuficiente
    const insufficientWithdrawResponse = await withdraw(token, '1001', 50);
    expect(insufficientWithdrawResponse.statusCode).toBe(400);
    expect(insufficientWithdrawResponse.body).toHaveProperty('error', 'Insufficient funds');

    // 7. Verificar que o saldo não mudou após tentativa falha
    const unchangedBalanceResponse = await getBalance(token, '1001');
    expect(unchangedBalanceResponse.body.balance).toBe(20);
  });

  test('Fluxo de criação automática de contas durante transferência', async () => {
    // 1. Criar conta de origem
    await createAccount(token, '2001', 100);
    
    // 2. Transferir para conta que não existe (deve criar automaticamente)
    const transferResponse = await transfer(token, '2001', '2002', 30);
    expect(transferResponse.statusCode).toBe(201);
    expect(transferResponse.body.destination.id).toBe('2002');
    expect(transferResponse.body.destination.balance).toBe(30);
    
    // 3. Verificar que a conta foi criada e tem o saldo correto
    const balanceResponse = await getBalance(token, '2002');
    expect(balanceResponse.statusCode).toBe(200);
    expect(balanceResponse.body.balance).toBe(30);
  });
});