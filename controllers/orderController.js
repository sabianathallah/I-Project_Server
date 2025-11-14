const midtransClient = require('midtrans-client');
const crypto = require('crypto');
const { Order, User } = require('../models');

// FIXED PRICE PER TICKET
const TICKET_PRICE = 20000; // Rp 20.000 per tiket

module.exports = {
  // create an order and return Midtrans snap token / redirect info
  create: async (req, res, next) => {
    try {
      const { ticketQuantity = 1, museumName, visitDate } = req.body;
      const UserId = req.user && req.user.id;

      if (!UserId) throw { name: 'Unauthorized', message: 'User is not authenticated' };
      if (!ticketQuantity || ticketQuantity < 1) {
        throw { name: 'BadRequest', message: 'ticketQuantity must be at least 1' };
      }

      // Calculate total price (BACKEND VALIDATION - SECURITY)
      const totalPrice = TICKET_PRICE * ticketQuantity;

      const order = await Order.create({
        UserId,
        price_amount: totalPrice,
        ticketQuantity,
        museumName,
        visitDate,
        status: 'pending'
      });

      const snap = new midtransClient.Snap({
        isProduction: false, // SELALU false kalau masih sandbox
        serverKey: process.env.MIDTRANS_SERVER_KEY,
        clientKey: process.env.MIDTRANS_CLIENT_KEY
      });

      const orderIdString = `ORDER-${order.id}-${Date.now()}`;

      const parameter = {
        transaction_details: {
          order_id: orderIdString,
          gross_amount: totalPrice
        },
        item_details: [
          {
            id: `ticket-${order.id}`,
            price: TICKET_PRICE,
            quantity: Number(ticketQuantity),
            name: `Ticket - ${museumName || 'Museum'}`
          }
        ],
        customer_details: {
          first_name: (req.user && (req.user.fullName || req.user.name)) || 'Customer',
          email: (req.user && req.user.email) || undefined
        }
      };

      const transaction = await snap.createTransaction(parameter);

      // store midtrans order id on our order record
      await order.update({ midtrans_orderId: orderIdString });

      res.status(201).json({
        message: 'Order created, Midtrans transaction created',
        order,
        ticketPrice: TICKET_PRICE,
        totalPrice,
        midtrans: transaction
      });
    } catch (err) {
      console.error('Order create error:', err.message);
      console.error('Full error:', err);
      next(err);
    }
  },

  // WEBHOOK HANDLER - Menerima notifikasi dari Midtrans
  handleWebhook: async (req, res, next) => {
    try {
      const notification = req.body;
      console.log('=== MIDTRANS WEBHOOK RECEIVED ===');
      console.log(notification);

      // Verify signature from Midtrans
      const serverKey = process.env.MIDTRANS_SERVER_KEY;
      const orderId = notification.order_id;
      const statusCode = notification.status_code;
      const grossAmount = notification.gross_amount;
      const signatureKey = notification.signature_key;

      // Create hash for verification
      const hash = crypto
        .createHash('sha512')
        .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
        .digest('hex');

      // Verify signature
      if (hash !== signatureKey) {
        console.error('Invalid signature');
        return res.status(403).json({ message: 'Invalid signature' });
      }

      console.log('✅ Signature verified');

      // Find order by midtrans_orderId
      const order = await Order.findOne({ where: { midtrans_orderId: orderId } });
      if (!order) {
        console.error('Order not found:', orderId);
        return res.status(404).json({ message: 'Order not found' });
      }

      const transactionStatus = notification.transaction_status;
      const fraudStatus = notification.fraud_status;

      console.log('Transaction status:', transactionStatus);
      console.log('Fraud status:', fraudStatus);

      // Generate ticket code function
      const generateTicketCode = () => {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `TIX-${timestamp}-${random}`;
      };

      // Update order status based on Midtrans notification
      if (transactionStatus === 'capture') {
        if (fraudStatus === 'accept') {
          // Payment captured successfully
          await order.update({
            status: 'paid',
            paidAt: new Date(),
            ticketCode: generateTicketCode()
          });
          console.log('✅ Order status updated to PAID');
        }
      } else if (transactionStatus === 'settlement') {
        // Payment settled
        await order.update({
          status: 'paid',
          paidAt: new Date(),
          ticketCode: generateTicketCode()
        });
        console.log('✅ Order status updated to PAID (settlement)');
      } else if (transactionStatus === 'pending') {
        // Payment pending
        await order.update({ status: 'pending' });
        console.log('⏳ Order status: PENDING');
      } else if (transactionStatus === 'deny') {
        // Payment denied
        await order.update({ status: 'cancelled' });
        console.log('❌ Order status updated to CANCELLED (deny)');
      } else if (transactionStatus === 'expire') {
        // Payment expired
        await order.update({
          status: 'expired',
          expiredAt: new Date()
        });
        console.log('⏰ Order status updated to EXPIRED');
      } else if (transactionStatus === 'cancel') {
        // Payment cancelled
        await order.update({ status: 'cancelled' });
        console.log('❌ Order status updated to CANCELLED');
      }

      // Send success response to Midtrans
      res.status(200).json({ message: 'Webhook processed successfully' });
    } catch (err) {
      console.error('Webhook error:', err.message);
      console.error('Full error:', err);
      next(err);
    }
  },

  // check transaction status from Midtrans and update our order
  status: async (req, res, next) => {
    try {
      const id = req.params.id;
      const order = await Order.findByPk(id);
      if (!order) throw { name: 'NotFound', message: 'Order not found' };

      if (!order.midtrans_orderId) {
        return res.status(200).json({ message: 'Order has no Midtrans transaction id', order });
      }

      const coreApi = new midtransClient.CoreApi({
        isProduction: false, // SELALU false kalau masih sandbox
        serverKey: process.env.MIDTRANS_SERVER_KEY,
        clientKey: process.env.MIDTRANS_CLIENT_KEY
      });

      let statusResp;
      try {
        statusResp = await coreApi.transaction.status(order.midtrans_orderId);
      } catch (midtransErr) {
        // Handle 404 - transaction not found (maybe still processing or not yet exist)
        if (midtransErr.httpStatusCode === 404 || midtransErr.httpStatusCode === '404') {
          return res.status(200).json({
            message: 'Transaction not found in Midtrans (may still be processing)',
            order,
            midtrans: { status: 'not_found' }
          });
        }
        throw midtransErr; // Re-throw other errors
      }

      // map Midtrans status to our order status
      const txStatus = statusResp.transaction_status;
      if (txStatus === 'settlement' || txStatus === 'capture') {
        await order.update({ status: 'paid', paidAt: new Date() });
      } else if (txStatus === 'deny' || txStatus === 'cancel') {
        await order.update({ status: 'cancelled' });
      } else if (txStatus === 'expire') {
        await order.update({ status: 'expired', expiredAt: new Date() });
      } else {
        // keep pending / other statuses
      }

      const fresh = await Order.findByPk(id);
      res.status(200).json({ midtrans: statusResp, order: fresh });
    } catch (err) {
      console.error('Order status check error:', err.message);
      console.error('Full error:', err);
      next(err);
    }
  }
};
