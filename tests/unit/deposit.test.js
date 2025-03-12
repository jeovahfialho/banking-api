const request = require('supertest');
const app = require('../../src/index');

describe('Depósito', () => {
  // Resetar o sistema antes dos testes
  beforeAll(async () => {
    await request(app)
      .post('/reset')
      .set('Authorization', `Bearer ${global.token}`);
  });

  // 4.1 Criar conta com saldo inicial
  test('Deve criar conta com depósito inicial', async () => {
    const response = await request(app)
      .post('/event')
      .set('Authorization', `Bearer ${global.token}`)
      .send({
        type: 'deposit',
        destination: '100',
        amount: 10
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('destination');
    expect(response.body.destination).toHaveProperty('id', '100');
    expect(response.body.destination).toHaveProperty('balance', 10);
  });

  // 4.2 Depósito em conta existente
  test('Deve adicionar saldo em conta existente', async () => {
    const response = await request(app)
      .post('/event')
      .set('Authorization', `Bearer ${global.token}`)
      .send({
        type: 'deposit',
        destination: '100',
        amount: 10
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('destination');
    expect(response.body.destination).toHaveProperty('id', '100');
    expect(response.body.destination).toHaveProperty('balance', 20);
  });

  // Testes adicionais
  test('Deve validar valor de depósito positivo', async () => {
    const response = await request(app)
      .post('/event')
      .set('Authorization', `Bearer ${global.token}`)
      .send({
        type: 'deposit',
        destination: '100',
        amount: -10
      });

    expect(response.statusCode).toBe(400);
  });

  test('Deve exigir destination para depósito', async () => {
    const response = await request(app)
      .post('/event')
      .set('Authorization', `Bearer ${global.token}`)
      .send({
        type: 'deposit',
        amount: 10
      });

    expect(response.statusCode).toBe(400);
  });
});