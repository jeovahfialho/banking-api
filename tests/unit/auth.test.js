const request = require('supertest');
const app = require('../../src/index');

describe('Autenticação', () => {
  let token;

  // 1.1 Login com credenciais corretas
  test('Deve fazer login com credenciais corretas', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        username: 'admin',
        pass: 'admin'
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('token');
    
    // Guardar token para testes subsequentes
    token = response.body.token;
  });

  // 1.2 Tentativa de acesso sem autenticação
  test('Deve negar acesso sem autenticação', async () => {
    const response = await request(app)
      .get('/balance?account_id=100');

    expect(response.statusCode).toBe(401);
  });

  // 1.3 Login com credenciais inválidas
  test('Deve rejeitar login com credenciais inválidas', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        username: 'invalid',
        pass: 'invalid'
      });

    expect(response.statusCode).toBe(403);
  });

  // Exportar token para outros testes
  afterAll(() => {
    global.token = token;
  });
});