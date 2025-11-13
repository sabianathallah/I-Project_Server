const crypto = require('crypto');

/**
 * Generate Midtrans Signature Key for testing webhook
 * Formula: SHA512(order_id + status_code + gross_amount + server_key)
 * 
 * Usage:
 * const signature = generateMidtransSignature('ORDER-1-123', '200', '40000.00');
 */
function generateMidtransSignature(orderId, statusCode, grossAmount) {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  
  if (!serverKey) {
    throw new Error('MIDTRANS_SERVER_KEY not found in environment variables');
  }

  const hash = crypto
    .createHash('sha512')
    .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
    .digest('hex');

  return hash;
}

/**
 * Generate complete webhook payload for testing
 */
function generateWebhookPayload(orderId, grossAmount, transactionStatus = 'settlement') {
  const statusCode = '200';
  const signature = generateMidtransSignature(orderId, statusCode, grossAmount);

  return {
    transaction_time: new Date().toISOString().replace('T', ' ').substring(0, 19),
    transaction_status: transactionStatus, // settlement, pending, deny, expire, cancel
    transaction_id: `test-txn-${Date.now()}`,
    status_message: 'midtrans payment notification',
    status_code: statusCode,
    signature_key: signature,
    payment_type: 'credit_card',
    order_id: orderId,
    merchant_id: 'G000000000',
    gross_amount: grossAmount,
    fraud_status: 'accept',
    currency: 'IDR'
  };
}

module.exports = {
  generateMidtransSignature,
  generateWebhookPayload
};
