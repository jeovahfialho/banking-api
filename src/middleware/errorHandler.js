// src/middleware/errorHandler.js
const { ApiError } = require('../utils/errors');
const config = require('../config');

/**
 * Middleware global para tratamento de erros
 * Fornece respostas padronizadas para diferentes tipos de erro
 */
module.exports = (err, req, res, next) => {
  // Log de erro para depuração
  console.error('Error Handler:', err);

  // Se for um erro de API personalizado
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ 
      error: err.message 
    });
  }

  // Se for um erro de validação do Express
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ 
      error: 'Invalid JSON' 
    });
  }

  // Se for um erro de SyntaxError
  if (err instanceof SyntaxError) {
    return res.status(400).json({ 
      error: 'Bad request' 
    });
  }

  // Erro não tratado - em produção, não envie detalhes do erro
  const isProduction = config.NODE_ENV === 'production';
  
  res.status(500).json({ 
    error: isProduction ? 'Internal Server Error' : err.message 
  });
};