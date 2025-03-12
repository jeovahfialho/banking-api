// src/services/accountService.js
const { AccountRepository } = require('../infrastructure/repositories');
const eventBus = require('../infrastructure/eventBus');
const { InsufficientFundsError, AccountNotFoundError } = require('../utils/errors');

// Instância do repositório
const accountRepository = new AccountRepository();

/**
 * Serviço de operações bancárias
 * Contém toda a lógica de negócio relacionada a contas
 */
module.exports = {
  /**
   * Obter saldo de uma conta
   * @param {string} accountId - ID da conta
   * @returns {Promise<number>} - Saldo da conta
   * @throws {AccountNotFoundError} - Se a conta não existir
   */
  getBalance: async (accountId) => {
    const account = await accountRepository.findById(accountId);
    
    if (!account) {
      throw new AccountNotFoundError();
    }
    
    return account.balance;
  },

  /**
   * Realizar um depósito
   * @param {string} accountId - ID da conta de destino
   * @param {number} amount - Valor a depositar
   * @returns {Promise<object>} - Resultado da operação
   */
  deposit: async (accountId, amount) => {
    // Buscar a conta (ou criar uma nova se não existir)
    let account = await accountRepository.findById(accountId);
    
    if (!account) {
      // Criar nova conta com saldo zero
      account = { id: accountId, balance: 0 };
    }
    
    // Realizar o depósito
    account.balance += amount;
    
    // Salvar a conta
    await accountRepository.save(account);
    
    // Emitir evento de depósito
    await eventBus.emit('deposit', { 
      accountId, 
      amount,
      newBalance: account.balance,
      timestamp: new Date().toISOString()
    });
    
    // Retornar objeto com os dados da conta
    return {
      destination: {
        id: accountId,
        balance: account.balance
      }
    };
  },

  /**
   * Realizar um saque
   * @param {string} accountId - ID da conta de origem
   * @param {number} amount - Valor a sacar
   * @returns {Promise<object>} - Resultado da operação
   * @throws {AccountNotFoundError} - Se a conta não existir
   * @throws {InsufficientFundsError} - Se não houver saldo suficiente
   */
  withdraw: async (accountId, amount) => {
    // Buscar a conta
    const account = await accountRepository.findById(accountId);
    
    // Verificar se a conta existe
    if (!account) {
      throw new AccountNotFoundError();
    }
    
    // Verificar se há saldo suficiente
    if (account.balance < amount) {
      throw new InsufficientFundsError();
    }
    
    // Realizar o saque
    account.balance -= amount;
    
    // Salvar a conta
    await accountRepository.save(account);
    
    // Emitir evento de saque
    await eventBus.emit('withdraw', { 
      accountId, 
      amount,
      newBalance: account.balance,
      timestamp: new Date().toISOString()
    });
    
    // Retornar objeto com os dados da conta
    return {
      origin: {
        id: accountId,
        balance: account.balance
      }
    };
  },

  /**
   * Realizar uma transferência entre contas
   * @param {string} fromAccountId - ID da conta de origem
   * @param {string} toAccountId - ID da conta de destino
   * @param {number} amount - Valor a transferir
   * @returns {Promise<object>} - Resultado da operação
   * @throws {AccountNotFoundError} - Se a conta de origem não existir
   * @throws {InsufficientFundsError} - Se não houver saldo suficiente
   */
  transfer: async (fromAccountId, toAccountId, amount) => {
    // Buscar a conta de origem
    const fromAccount = await accountRepository.findById(fromAccountId);
    
    // Verificar se a conta de origem existe
    if (!fromAccount) {
      throw new AccountNotFoundError();
    }
    
    // Verificar se há saldo suficiente
    if (fromAccount.balance < amount) {
      throw new InsufficientFundsError();
    }
    
    // Buscar ou criar a conta de destino
    let toAccount = await accountRepository.findById(toAccountId);
    if (!toAccount) {
      toAccount = { id: toAccountId, balance: 0 };
    }
    
    // Realizar a transferência
    fromAccount.balance -= amount;
    toAccount.balance += amount;
    
    // Salvar as contas
    await accountRepository.save(fromAccount);
    await accountRepository.save(toAccount);
    
    // Emitir evento de transferência
    await eventBus.emit('transfer', { 
      fromAccountId, 
      toAccountId, 
      amount,
      fromBalance: fromAccount.balance,
      toBalance: toAccount.balance,
      timestamp: new Date().toISOString()
    });
    
    // Retornar objeto com os dados das contas
    return {
      origin: {
        id: fromAccountId,
        balance: fromAccount.balance
      },
      destination: {
        id: toAccountId,
        balance: toAccount.balance
      }
    };
  },

  /**
   * Resetar o sistema (limpar todas as contas)
   * @returns {Promise<boolean>} - Sucesso da operação
   */
  resetSystem: async () => {
    // Limpar todas as contas
    await accountRepository.deleteAll();
    
    // Emitir evento de reset
    await eventBus.emit('systemReset', {
      timestamp: new Date().toISOString()
    });
    
    return true;
  }
};