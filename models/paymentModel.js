const { pool } = require('../config/db');
const taxProfileModel = require('./taxProfileModel');

class PaymentModel {
  // Create a new payment
  async createPayment(paymentData) {
    try {
      const { userId, taxProfileId, amount, paymentMethod, transactionId = null } = paymentData;
      
      // Validate amount
      if (!amount || amount <= 0) {
        throw new Error('Payment amount must be greater than 0');
      }
      
      // Check if tax profile exists
      const taxProfile = await taxProfileModel.getTaxProfileById(taxProfileId);
      
      // Check if user owns this tax profile
      if (taxProfile.user_id !== parseInt(userId)) {
        throw new Error('This tax profile does not belong to the user');
      }
      
      // Calculate remaining tax due
      const remainingDue = Math.max(0, parseFloat(taxProfile.tax_due) - parseFloat(taxProfile.tax_paid));
      
      // Check if tax is already fully paid
      if (remainingDue <= 0) {
        throw new Error('Tax is already fully paid for this profile');
      }
      
      // Limit payment to the amount due if paying more than due
      const paymentAmount = Math.min(parseFloat(amount), remainingDue);
      
      // Start a transaction
      const connection = await pool.getConnection();
      await connection.beginTransaction();
      
      try {
        // Insert payment record
        const [result] = await connection.query(
          'INSERT INTO payments (user_id, tax_profile_id, amount, payment_method, transaction_id) VALUES (?, ?, ?, ?, ?)',
          [userId, taxProfileId, paymentAmount, paymentMethod, transactionId]
        );
        
        // Calculate new tax paid amount
        const newTaxPaid = parseFloat(taxProfile.tax_paid) + paymentAmount;
        
        // Determine the new status based on remaining due after this payment
        const newStatus = newTaxPaid >= parseFloat(taxProfile.tax_due) ? 'paid' : 'partially_paid';
        
        // Update tax profile
        await connection.query(
          'UPDATE tax_profiles SET tax_paid = ?, status = ? WHERE id = ?',
          [newTaxPaid, newStatus, taxProfileId]
        );
        
        // Commit transaction
        await connection.commit();
        connection.release();
        
        // Get the payment with details
        const [payments] = await pool.query(
          'SELECT * FROM payments WHERE id = ?',
          [result.insertId]
        );
        
        // Get updated tax profile
        const updatedProfile = await taxProfileModel.getTaxProfileById(taxProfileId);
        
        return {
          payment: payments[0],
          taxProfile: updatedProfile
        };
      } catch (error) {
        // Rollback transaction on error
        await connection.rollback();
        connection.release();
        throw error;
      }
    } catch (error) {
      throw error;
    }
  }
  
  // Get payment by ID
  async getPaymentById(id) {
    try {
      const [payments] = await pool.query(
        'SELECT * FROM payments WHERE id = ?',
        [id]
      );
      
      if (payments.length === 0) {
        throw new Error('Payment not found');
      }
      
      return payments[0];
    } catch (error) {
      throw error;
    }
  }
  
  // Get all payments for a user
  async getUserPayments(userId) {
    try {
      const [payments] = await pool.query(
        `SELECT p.*, tp.fiscal_year 
         FROM payments p
         JOIN tax_profiles tp ON p.tax_profile_id = tp.id
         WHERE p.user_id = ?
         ORDER BY p.payment_date DESC`,
        [userId]
      );
      
      return payments;
    } catch (error) {
      throw error;
    }
  }
  
  // Get payments for a specific tax profile
  async getTaxProfilePayments(taxProfileId) {
    try {
      const [payments] = await pool.query(
        'SELECT * FROM payments WHERE tax_profile_id = ? ORDER BY payment_date DESC',
        [taxProfileId]
      );
      
      return payments;
    } catch (error) {
      throw error;
    }
  }
  
  // Get payment summary
  async getPaymentSummary(userId) {
    try {
      const [summary] = await pool.query(
        `SELECT 
          SUM(amount) as total_paid,
          COUNT(*) as payment_count,
          MAX(payment_date) as last_payment_date
         FROM payments
         WHERE user_id = ?`,
        [userId]
      );
      
      return {
        totalPaid: summary[0].total_paid || 0,
        paymentCount: summary[0].payment_count || 0,
        lastPaymentDate: summary[0].last_payment_date || null
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new PaymentModel(); 