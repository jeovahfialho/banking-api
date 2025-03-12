// src/routes/index.js
const express = require('express');
const authController = require('../controllers/authController');
const accountController = require('../controllers/accountController');
const authenticateJWT = require('../middleware/authenticateJWT');

const router = express.Router();

/**
 * Rotas de autenticação (públicas)
 */
router.post('/login', authController.login);

/**
 * Rotas de operações bancárias (protegidas por JWT)
 */
// Consulta de saldo
router.get('/balance', authenticateJWT, accountController.getBalance);

// Reset do sistema
router.post('/reset', authenticateJWT, accountController.resetSystem);

// Processamento de eventos (depósito, saque, transferência)
router.post('/event', authenticateJWT, accountController.handleEvent);

module.exports = router;