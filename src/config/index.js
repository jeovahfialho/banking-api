// src/config/index.js
// Carrega variáveis de ambiente do arquivo .env
require('dotenv').config();

/**
 * Configuração centralizada da aplicação
 * Usa variáveis de ambiente com valores padrão quando não definidas
 */
module.exports = {
  // Ambiente da aplicação
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Porta do servidor
  PORT: parseInt(process.env.PORT || '3000', 10),
  
  // Configurações JWT
  JWT: {
    SECRET: process.env.JWT_SECRET || 'seu_jwt_secret_aqui',
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h'
  },
  
  // Tipo de banco de dados (memory, mongodb)
  DB_TYPE: process.env.DB_TYPE || 'memory',
  
  // Configuração do MongoDB (se necessário)
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/banking'
};