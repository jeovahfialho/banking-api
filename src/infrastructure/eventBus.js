// src/infrastructure/eventBus.js
const EventEmitter = require('events');
const { EventRepository } = require('./repositories');

/**
 * Singleton do barramento de eventos do sistema
 */
class EventBus {
  constructor() {
    this.emitter = new EventEmitter();
    this.eventRepository = new EventRepository();
    
    // Configurar handlers padrão
    this.setupDefaultHandlers();
  }
  
  setupDefaultHandlers() {
    this.on('deposit', (data) => {
      console.log(`Depósito de ${data.amount} na conta ${data.accountId} realizado com sucesso.`);
    });

    this.on('withdraw', (data) => {
      console.log(`Saque de ${data.amount} da conta ${data.accountId} realizado com sucesso.`);
    });

    this.on('transfer', (data) => {
      console.log(`Transferência de ${data.amount} da conta ${data.fromAccountId} para ${data.toAccountId} realizada com sucesso.`);
    });

    this.on('systemReset', () => {
      console.log('Sistema resetado com sucesso.');
    });
  }
  
  on(eventType, listener) {
    this.emitter.on(eventType, listener);
  }
  
  async emit(eventType, data) {
    // Criar objeto de evento
    const event = {
      type: eventType,
      data,
      timestamp: new Date().toISOString()
    };
    
    try {
      // Persistir o evento
      await this.eventRepository.save(event);
      
      // Emitir o evento para os handlers
      this.emitter.emit(eventType, data);
      
      return event;
    } catch (error) {
      console.error(`Erro ao emitir evento ${eventType}:`, error);
      return event;
    }
  }
  
  removeAllListeners() {
    this.emitter.removeAllListeners();
  }
}

// Criar instância singleton
const eventBus = new EventBus();

// Exportar a instância única
module.exports = eventBus;