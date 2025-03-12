// src/index.js - Ponto de entrada da aplicação
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { initializeDatabase } = require('./infrastructure/database');
const config = require('./config');

// Inicialização da aplicação Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log de requisições em ambiente de desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// Inicialização do banco de dados
initializeDatabase();

// Rotas
app.use(routes);

// Rota de verificação de saúde
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Middleware de tratamento de erros (deve ser o último middleware)
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════╗
║                                                ║
║   Sistema Bancário API - Rodando na porta ${PORT}   ║
║                                                ║
╚════════════════════════════════════════════════╝
  `);
  
  console.log(`Ambiente: ${process.env.NODE_ENV || 'desenvolvimento'}`);
  console.log(`Banco de dados: ${config.DB_TYPE}`);
});

// Tratamento de exceções não capturadas
process.on('uncaughtException', (error) => {
  console.error('Erro não tratado:', error);
  // Em produção, você poderia enviar o erro para um serviço de monitoramento
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promessa rejeitada não tratada:', reason);
  // Em produção, você poderia enviar o erro para um serviço de monitoramento
});

module.exports = app; // Para testes