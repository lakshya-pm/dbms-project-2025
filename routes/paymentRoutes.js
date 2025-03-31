const express = require('express');
const router = express.Router();
const paymentModel = require('../models/paymentModel');

// Make a payment
router.post('/', async (req, res) => {
  try {
    const { userId, taxProfileId, amount, paymentMethod, transactionId } = req.body;
    
    // Validate input
    if (!userId || !taxProfileId || !amount || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Please provide userId, taxProfileId, amount and paymentMethod'
      });
    }
    
    const result = await paymentModel.createPayment({
      userId,
      taxProfileId,
      amount,
      paymentMethod,
      transactionId
    });
    
    res.status(201).json({
      success: true,
      message: 'Payment processed successfully',
      data: result
    });
  } catch (error) {
    if (error.message === 'Payment amount must be greater than 0') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.message === 'Tax profile not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.message === 'This tax profile does not belong to the user' ||
        error.message === 'Tax is already fully paid for this profile') {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }
    
    console.error('Error processing payment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing payment'
    });
  }
});

// Get a payment by ID
router.get('/:id', async (req, res) => {
  try {
    const paymentId = req.params.id;
    const payment = await paymentModel.getPaymentById(paymentId);
    
    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    if (error.message === 'Payment not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    console.error('Error fetching payment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching payment'
    });
  }
});

// Get all payments for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const payments = await paymentModel.getUserPayments(userId);
    
    res.status(200).json({
      success: true,
      data: payments
    });
  } catch (error) {
    console.error('Error fetching user payments:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching payments'
    });
  }
});

// Get payments for a tax profile
router.get('/tax-profile/:taxProfileId', async (req, res) => {
  try {
    const taxProfileId = req.params.taxProfileId;
    const payments = await paymentModel.getTaxProfilePayments(taxProfileId);
    
    res.status(200).json({
      success: true,
      data: payments
    });
  } catch (error) {
    console.error('Error fetching tax profile payments:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching payments'
    });
  }
});

// Get payment summary for a user
router.get('/user/:userId/summary', async (req, res) => {
  try {
    const userId = req.params.userId;
    const summary = await paymentModel.getPaymentSummary(userId);
    
    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error fetching payment summary:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching payment summary'
    });
  }
});

module.exports = router; 