const request = require('supertest');
const app = require('../../src/index');

describe('Consulta de Saldo', () => {
  // Primeiro criar uma conta para os testes
  beforeAll(async () => {
    // Criar conta com depósito inicial
    await request(app)
      .post('/event')
      .set('Authorization', `Bearer ${global.token}`)
      .send({
        type: 'deposit',
        destination: '100',
        amount: 20
      });
  });

  // 3.1 Conta inexistente
  test('Deve retornar 404 para conta inexistente', async () => {
    const response = await request(app)
      .get('/balance?account_id=1234')
      .set('Authorization', `Bearer ${global.token}`);

    expect(response.statusCode).toBe(404);
  });

  // 3.2 Conta existente
  test('Deve retornar saldo para conta existente', async () => {
    const response = await request(app)
      .get('/balance?account_id=100')
      .set('Authorization', `Bearer ${global.token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('balance');
    expect(response.body.balance).toBe(20);
  });

  // Testes adicionais
  test('Deve exigir parâmetro account_id', async () => {
    const response = await request(app)
      .get('/balance')
      .set('Authorization', `Bearer ${global.token}`);

    expect(response.statusCode).toBe(400);
  });
});