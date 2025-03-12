// src/infrastructure/database.js
const config = require('../config');

/**
 * Implementação de banco de dados em memória
 * Para demonstração - em produção, usaria um banco de dados real
 */
const inMemoryDB = {
  // Armazenamento de contas (Map para acesso rápido por ID)
  accounts: new Map(),
  
  // Armazenamento de eventos (para eventSourcing e histórico)
  events: []
};

/**
 * Inicializa o banco de dados com base na configuração
 */
const initializeDatabase = () => {
  console.log(`Inicializando banco de dados (tipo: ${config.DB_TYPE})`);
  
  // Para um banco de dados real, aqui estaria a lógica de conexão
  if (config.DB_TYPE === 'mongodb') {
    console.log('Conexão com MongoDB não implementada nesta versão de demonstração');
    // Em um sistema real:
    // const mongoose = require('mongoose');
    // return mongoose.connect(config.MONGO_URI);
  }
  
  // Para o banco em memória, não é necessário fazer nada
  console.log('Usando banco de dados em memória');
  return Promise.resolve();
};

/**
 * Obtém a instância do banco de dados
 */
const getDatabase = () => {
  return inMemoryDB;
};

module.exports = {
  initializeDatabase,
  getDatabase
};