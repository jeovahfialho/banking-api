// tests/setup.js
const request = require('supertest');
const app = require('../../src/index');

// Configuração global para os testes
global.token = null;

// Tempo máximo para cada teste (para evitar timeouts)
jest.setTimeout(30000);

// Obter token antes de TODOS os testes
beforeAll(async () => {
  try {
    const response = await request(app)
      .post('/login')
      .send({
        username: 'admin',
        pass: 'admin'
      });
    
    if (response.statusCode !== 200 || !response.body.token) {
      throw new Error(`Failed to authenticate for tests: ${JSON.stringify(response.body)}`);
    }
    
    global.token = response.body.token;
    console.log('Token de autenticação obtido com sucesso:', global.token);
  } catch (error) {
    console.error('Erro ao obter token de autenticação:', error);
    throw error; // Para falhar os testes caso não consiga autenticar
  }
});

// Função auxiliar para obter token (caso seja necessário em algum teste específico)
async function getAuthToken() {
  const response = await request(app)
    .post('/login')
    .send({
      username: 'admin',
      pass: 'admin'
    });
  
  if (response.statusCode !== 200) {
    throw new Error('Failed to authenticate for tests');
  }
  
  return response.body.token;
}

module.exports = {
  getAuthToken
};