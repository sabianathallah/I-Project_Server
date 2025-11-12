const midtransClient = require('midtrans-client');
const { Order, User } = require('../models');

module.exports = {
  // create an order and return Midtrans snap token / redirect info
  create: async (req, res, next) => {
    try {
      const { price_amount, ticketQuantity = 1, museumName, visitDate } = req.body;
      const UserId = req.user && req.user.id;

      if (!UserId) throw { name: 'Unauthorized', message: 'User is not authenticated' };
      if (!price_amount) throw { name: 'BadRequest', message: 'price_amount is required' };

      const order = await Order.create({
        UserId,
        price_amount,
        ticketQuantity,
        museumName,
        visitDate,
        status: 'pending'
      });

      const snap = new midtransClient.Snap({
        isProduction: process.env.NODE_ENV === 'production',
        serverKey: process.env.MIDTRANS_SERVER_KEY,
        clientKey: process.env.MIDTRANS_CLIENT_KEY
      });

      const orderIdString = `ORDER-${order.id}-${Date.now()}`;

      // Calculate price per item (assuming price_amount is total)
      const pricePerItem = Math.floor(Number(price_amount) / Number(ticketQuantity));

      const parameter = {
        transaction_details: {
          order_id: orderIdString,
          gross_amount: Number(price_amount)
        },
        item_details: [
          {
            id: `ticket-${order.id}`,
            price: pricePerItem,
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
        midtrans: transaction
      });
    } catch (err) {
      console.error('Order create error:', err.message);
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
        isProduction: process.env.NODE_ENV === 'production',
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
