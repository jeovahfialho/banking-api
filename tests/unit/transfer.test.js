const request = require('supertest');
const app = require('../../src/index');

describe('Transferência', () => {
  // Configurar o estado inicial antes dos testes
  beforeAll(async () => {
    // Resetar o sistema
    await request(app)
      .post('/reset')
      .set('Authorization', `Bearer ${global.token}`);
    
    // Criar conta origem com saldo
    await request(app)
      .post('/event')
      .set('Authorization', `Bearer ${global.token}`)
      .send({
        type: 'deposit',
        destination: '100',
        amount: 15
      });
    
    // Criar conta destino
    await request(app)
      .post('/event')
      .set('Authorization', `Bearer ${global.token}`)
      .send({
        type: 'deposit',
        destination: '300',
        amount: 0.01
      });
  });

  // 6.1 Transferência entre contas existentes
  test('Deve transferir entre contas existentes', async () => {
    const response = await request(app)
      .post('/event')
      .set('Authorization', `Bearer ${global.token}`)
      .send({
        type: 'transfer',
        origin: '100',
        amount: 15,
        destination: '300'
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('origin');
    expect(response.body).toHaveProperty('destination');
    expect(response.body.origin).toHaveProperty('id', '100');
    expect(response.body.origin).toHaveProperty('balance', 0);
    expect(response.body.destination).toHaveProperty('id', '300');
    expect(response.body.destination).toHaveProperty('balance', 15.01);
  });

  // 6.2 Transferência com origem inexistente
  test('Deve rejeitar transferência com origem inexistente', async () => {
    const response = await request(app)
      .post('/event')
      .set('Authorization', `Bearer ${global.token}`)
      .send({
        type: 'transfer',
        origin: '200',
        amount: 15,
        destination: '300'
      });

    expect(response.statusCode).toBe(404);
  });

  // 6.3 Transferência com saldo insuficiente
  test('Deve rejeitar transferência com saldo insuficiente', async () => {
    // Cria uma nova conta para este teste específico
    await request(app)
      .post('/event')
      .set('Authorization', `Bearer ${global.token}`)
      .send({
        type: 'deposit',
        destination: '400',
        amount: 10
      });

    const response = await request(app)
      .post('/event')
      .set('Authorization', `Bearer ${global.token}`)
      .send({
        type: 'transfer',
        origin: '400',
        amount: 50,
        destination: '300'
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error', 'Insufficient funds');
  });

  // Testes adicionais
  test('Deve validar valor de transferência positivo', async () => {
    const response = await request(app)
      .post('/event')
      .set('Authorization', `Bearer ${global.token}`)
      .send({
        type: 'transfer',
        origin: '300',
        amount: -5,
        destination: '100'
      });

    expect(response.statusCode).toBe(400);
  });

  test('Deve exigir origem e destino para transferência', async () => {
    const response = await request(app)
      .post('/event')
      .set('Authorization', `Bearer ${global.token}`)
      .send({
        type: 'transfer',
        amount: 5
      });

    expect(response.statusCode).toBe(400);
  });

  test('Deve criar conta de destino automaticamente se não existir', async () => {
    // Primeiro cria uma conta de origem com saldo
    await request(app)
      .post('/event')
      .set('Authorization', `Bearer ${global.token}`)
      .send({
        type: 'deposit',
        destination: '500',
        amount: 25
      });
    
    // Agora faz uma transferência para uma conta que não existe
    const response = await request(app)
      .post('/event')
      .set('Authorization', `Bearer ${global.token}`)
      .send({
        type: 'transfer',
        origin: '500',
        amount: 15,
        destination: '600'
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.destination).toHaveProperty('id', '600');
    expect(response.body.destination).toHaveProperty('balance', 15);
  });
});