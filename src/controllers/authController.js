// src/controllers/authController.js
const jwt = require('jsonwebtoken');
const config = require('../config');
const { InvalidCredentialsError, BadRequestError } = require('../utils/errors');

/**
 * Controller de autenticação
 * Gerencia login e autenticação de usuários
 */
module.exports = {
  /**
   * Login de usuário
   * Verifica as credenciais e gera um token JWT
   */
  login: (req, res, next) => {
    try {
      const { username, pass } = req.body;

      // Validar dados de entrada
      if (!username || !pass) {
        throw new BadRequestError('Username and password are required');
      }

      // Verificação simples de credenciais (apenas para demonstração)
      // Em um sistema real, você verificaria contra um banco de dados
      if (username === 'admin' && pass === 'admin') {
        // Gerar token JWT
        const token = jwt.sign(
          { 
            username,
            role: 'admin'
          },
          config.JWT.SECRET,
          {
            expiresIn: config.JWT.EXPIRES_IN
          }
        );

        // Retornar o token
        return res.status(200).json({ token });
      }

      // Credenciais inválidas
      throw new InvalidCredentialsError();
    } catch (error) {
      next(error);
    }
  }
};