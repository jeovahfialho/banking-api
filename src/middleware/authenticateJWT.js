// src/middleware/authenticateJWT.js
const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Middleware para autenticação JWT
 * Verifica se o token é válido e adiciona os dados do usuário à requisição
 */
module.exports = (req, res, next) => {
  // Extrair o header de autorização
  const authHeader = req.headers.authorization;

  // Verificar se o header existe
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Extrair o token do formato "Bearer <token>"
  const token = authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Verificar se o token é válido
    const decoded = jwt.verify(token, config.JWT.SECRET);
    
    // Adicionar o usuário à requisição para uso em controladores
    req.user = decoded;
    
    // Prosseguir para o próximo middleware ou rota
    next();
  } catch (error) {
    console.error('JWT Verification Error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    return res.status(403).json({ error: 'Forbidden' });
  }
};