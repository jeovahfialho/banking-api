const request = require('supertest');
const app = require('../../src/index');

describe('Saque', () => {
  // Configurar o estado inicial antes dos testes
  beforeAll(async () => {
    // Resetar o sistema
    await request(app)
      .post('/reset')
      .set('Authorization', `Bearer ${global.token}`);
    
    // Criar conta com saldo inicial
    await request(app)
      .post('/event')
      .set('Authorization', `Bearer ${global.token}`)
      .send({
        type: 'deposit',
        destination: '100',
        amount: 20
      });
  });

  // 5.1 Saque de conta inexistente
  test('Deve retornar 404 para saque de conta inexistente', async () => {
    const response = await request(app)
      .post('/event')
      .set('Authorization', `Bearer ${global.token}`)
      .send({
        type: 'withdraw',
        origin: '200',
        amount: 10
      });

    expect(response.statusCode).toBe(404);
  });

  // 5.2 Saque de conta existente
  test('Deve permitir saque de conta existente', async () => {
    const response = await request(app)
      .post('/event')
      .set('Authorization', `Bearer ${global.token}`)
      .send({
        type: 'withdraw',
        origin: '100',
        amount: 5
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('origin');
    expect(response.body.origin).toHaveProperty('id', '100');
    expect(response.body.origin).toHaveProperty('balance', 15);
  });

  // 5.3 Saque com saldo insuficiente
  test('Deve rejeitar saque com saldo insuficiente', async () => {
    const response = await request(app)
      .post('/event')
      .set('Authorization', `Bearer ${global.token}`)
      .send({
        type: 'withdraw',
        origin: '100',
        amount: 50
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error', 'Insufficient funds');
  });

  // Testes adicionais
  test('Deve validar valor de saque positivo', async () => {
    const response = await request(app)
      .post('/event')
      .set('Authorization', `Bearer ${global.token}`)
      .send({
        type: 'withdraw',
        origin: '100',
        amount: -5
      });

    expect(response.statusCode).toBe(400);
  });

  test('Deve exigir origin para saque', async () => {
    const response = await request(app)
      .post('/event')
      .set('Authorization', `Bearer ${global.token}`)
      .send({
        type: 'withdraw',
        amount: 5
      });

    expect(response.statusCode).toBe(400);
  });
});