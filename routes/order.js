const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/orderController');

// Webhook endpoint from Midtrans (NO AUTHENTICATION - called by Midtrans server)
// This must be registered as PUBLIC route in main index.js
router.post('/webhook', OrderController.handleWebhook);

// Create a new order and start Midtrans transaction (requires authentication)
router.post('/', OrderController.create);

// Get order payment status and sync with Midtrans
router.get('/:id/status', OrderController.status);

module.exports = router;
