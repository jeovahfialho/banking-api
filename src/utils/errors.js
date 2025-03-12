// src/utils/errors.js

/**
 * Classe base para erros de API
 * Permite status HTTP personalizado e nome de erro
 */
class ApiError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
      this.name = this.constructor.name;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  /**
   * Erro para fundos insuficientes
   */
  class InsufficientFundsError extends ApiError {
    constructor() {
      super('Insufficient funds', 400);
    }
  }
  
  /**
   * Erro para conta não encontrada
   */
  class AccountNotFoundError extends ApiError {
    constructor() {
      super('Account not found', 404);
    }
  }
  
  /**
   * Erro para credenciais inválidas
   */
  class InvalidCredentialsError extends ApiError {
    constructor() {
      super('Invalid credentials', 403);
    }
  }
  
  /**
   * Erro para requisição inválida
   */
  class BadRequestError extends ApiError {
    constructor(message = 'Bad request') {
      super(message, 400);
    }
  }
  
  /**
   * Erro para operações não autorizadas
   */
  class UnauthorizedError extends ApiError {
    constructor(message = 'Unauthorized') {
      super(message, 401);
    }
  }
  
  module.exports = {
    ApiError,
    InsufficientFundsError,
    AccountNotFoundError,
    InvalidCredentialsError,
    BadRequestError,
    UnauthorizedError
  };