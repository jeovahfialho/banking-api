// src/infrastructure/repositories.js
const { getDatabase } = require('./database');
const config = require('../config');

/**
 * Repositório de contas
 * Abstrai o acesso ao armazenamento de dados para contas
 */
class AccountRepository {
  constructor() {
    this.db = getDatabase();
  }
  
  /**
   * Buscar uma conta pelo ID
   * @param {string} id - ID da conta
   * @returns {Promise<object|null>} - Conta encontrada ou null
   */
  async findById(id) {
    // Em um sistema real, seria uma consulta ao banco de dados
    return this.db.accounts.get(id) || null;
  }
  
  /**
   * Salvar uma conta (criar ou atualizar)
   * @param {object} account - Dados da conta
   * @returns {Promise<object>} - Conta salva
   */
  async save(account) {
    // Garantir que a conta tenha um ID
    if (!account.id) {
      throw new Error('Account must have an ID');
    }
    
    // Em um sistema real, seria um insert/update no banco
    this.db.accounts.set(account.id, {
      ...account,
      updatedAt: new Date().toISOString()
    });
    
    return account;
  }
  
  /**
   * Listar todas as contas
   * @returns {Promise<Array>} - Lista de contas
   */
  async findAll() {
    // Converter o Map para Array
    return [...this.db.accounts.values()];
  }
  
  /**
   * Excluir uma conta
   * @param {string} id - ID da conta
   * @returns {Promise<boolean>} - Sucesso da operação
   */
  async delete(id) {
    return this.db.accounts.delete(id);
  }
  
  /**
   * Excluir todas as contas (reset)
   * @returns {Promise<boolean>} - Sucesso da operação
   */
  async deleteAll() {
    this.db.accounts.clear();
    return true;
  }
}

/**
 * Repositório de eventos
 * Para implementação de Event Sourcing
 */
class EventRepository {
  constructor() {
    this.db = getDatabase();
  }
  
  /**
   * Salvar um evento
   * @param {object} event - Dados do evento
   * @returns {Promise<object>} - Evento salvo
   */
  async save(event) {
    try {
      // Adicionar timestamp se não existir
      if (!event.timestamp) {
        event.timestamp = new Date().toISOString();
      }
      
      // Adicionar ID sequencial
      event.id = this.db.events.length + 1;
      
      // Em um sistema real, seria um insert no banco
      this.db.events.push(event);
      
      return event;
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
      // Retornar o evento mesmo em caso de erro para não quebrar o fluxo
      return event;
    }
  }
  
  /**
   * Buscar eventos por tipo
   * @param {string} type - Tipo de evento
   * @returns {Promise<Array>} - Lista de eventos
   */
  async findByType(type) {
    return this.db.events.filter(event => event.type === type);
  }
  
  /**
   * Buscar eventos relacionados a uma conta
   * @param {string} accountId - ID da conta
   * @returns {Promise<Array>} - Lista de eventos
   */
  async findByAccount(accountId) {
    return this.db.events.filter(event => 
      event.accountId === accountId ||
      event.fromAccountId === accountId ||
      event.toAccountId === accountId
    );
  }
  
  /**
   * Limpar todos os eventos
   * @returns {Promise<boolean>} - Sucesso da operação
   */
  async deleteAll() {
    this.db.events.length = 0;
    return true;
  }
}

// Exportar os repositórios
module.exports = {
  AccountRepository,
  EventRepository
};