const request = require('supertest');
const app = require('../../src/index');

describe('Reset do Sistema', () => {
  // 2.1 Reset do sistema
  test('Deve resetar o sistema com autenticação válida', async () => {
    const response = await request(app)
      .post('/reset')
      .set('Authorization', `Bearer ${global.token}`);

    expect(response.statusCode).toBe(200);
  });

  test('Deve negar reset do sistema sem autenticação', async () => {
    const response = await request(app)
      .post('/reset');

    expect(response.statusCode).toBe(401);
  });
});