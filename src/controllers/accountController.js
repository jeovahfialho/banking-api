// src/controllers/accountController.js
const accountService = require('../services/accountService');
const { 
  InsufficientFundsError, 
  AccountNotFoundError, 
  BadRequestError 
} = require('../utils/errors');

/**
 * Controller de operações bancárias
 * Gerencia operações de conta, transações e consultas
 */
module.exports = {
  /**
   * Obter saldo de uma conta
   */
  getBalance: async (req, res, next) => {
    try {
      const { account_id } = req.query;

      // Validar parâmetros
      if (!account_id) {
        throw new BadRequestError('Account ID is required');
      }

      // Buscar saldo
      const balance = await accountService.getBalance(account_id);
      
      // Retornar o saldo
      res.status(200).json({ balance });
    } catch (error) {
      // Passa o erro para o middleware de tratamento de erros
      next(error);
    }
  },

  /**
   * Resetar o estado do sistema
   */
  resetSystem: async (req, res, next) => {
    try {
      // Realizar reset
      await accountService.resetSystem();
      
      // Retornar sucesso
      res.status(200).json({ message: 'OK' });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Processar eventos bancários (depósito, saque, transferência)
   */
  handleEvent: async (req, res, next) => {
    try {
      const { type, origin, destination, amount } = req.body;

      // Validar tipo de evento
      if (!type || !['deposit', 'withdraw', 'transfer'].includes(type)) {
        throw new BadRequestError('Invalid event type');
      }

      // Validar valor
      if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        throw new BadRequestError('Amount must be a positive number');
      }

      // Tratar diferentes tipos de eventos
      let result;
      switch (type) {
        case 'deposit':
          // Validar conta de destino
          if (!destination) {
            throw new BadRequestError('Destination account is required for deposits');
          }
          // Processar depósito
          result = await accountService.deposit(destination, parseFloat(amount));
          break;

        case 'withdraw':
          // Validar conta de origem
          if (!origin) {
            throw new BadRequestError('Origin account is required for withdrawals');
          }
          // Processar saque
          result = await accountService.withdraw(origin, parseFloat(amount));
          break;

        case 'transfer':
          // Validar contas de origem e destino
          if (!origin) {
            throw new BadRequestError('Origin account is required for transfers');
          }
          if (!destination) {
            throw new BadRequestError('Destination account is required for transfers');
          }
          // Validar que origem e destino são diferentes
          if (origin === destination) {
            throw new BadRequestError('Origin and destination accounts must be different');
          }
          // Processar transferência
          result = await accountService.transfer(
            origin, 
            destination, 
            parseFloat(amount)
          );
          break;
      }

      // Retornar resultado da operação
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
};