const { pool } = require('../config/db');

class TaxProfileModel {
  // Calculate tax based on income and tax rates using 2025 Indian tax regime
  async calculateTax(income, fiscalYear = '2023-2024') {
    try {
      // Apply the 2025 Indian tax regime as per the Union Budget
      const annualIncome = parseFloat(income);
      
      // Standard deduction for salaried individuals
      const standardDeduction = 75000; // Increased from 50,000
      
      // Basic exemption limit
      const basicExemptionLimit = 1200000; // 12 lakh exemption

      // Apply standard deduction first
      let taxableIncome = Math.max(0, annualIncome - standardDeduction);
      
      // Check if income is below exemption limit
      if (taxableIncome <= basicExemptionLimit) {
        return 0; // No tax for income up to 12.75 lakh (12 lakh + 75k deduction)
      }
      
      // Tax calculation based on slabs
      let totalTax = 0;
      
      // Define the tax slabs as per 2025 Union Budget
      const taxSlabs = [
        { min: 400000, max: 800000, rate: 0.05 },  // 4-8 lakh: 5%
        { min: 800000, max: 1200000, rate: 0.10 }, // 8-12 lakh: 10%
        { min: 1200000, max: 1600000, rate: 0.15 }, // 12-16 lakh: 15%
        { min: 1600000, max: 2000000, rate: 0.20 }, // 16-20 lakh: 20%
        { min: 2000000, max: 2400000, rate: 0.25 }, // 20-24 lakh: 25%
        { min: 2400000, max: Infinity, rate: 0.30 }  // Above 24 lakh: 30%
      ];
      
      // Calculate tax slab by slab
      for (const slab of taxSlabs) {
        // Only apply tax for income above 12 lakh (the exemption limit)
        const effectiveMin = Math.max(slab.min, basicExemptionLimit);
        
        if (taxableIncome > effectiveMin) {
          const taxableAmountInSlab = Math.min(taxableIncome, slab.max) - effectiveMin;
          if (taxableAmountInSlab > 0) {
            totalTax += taxableAmountInSlab * slab.rate;
          }
        }
      }
      
      // Round to 2 decimal places
      return parseFloat(totalTax.toFixed(2));
    } catch (error) {
      throw error;
    }
  }
  
  // Create a tax profile for a user
  async createTaxProfile(userId, income, fiscalYear = '2023-2024') {
    try {
      // Check if user exists
      const [users] = await pool.query('SELECT id FROM users WHERE id = ?', [userId]);
      if (users.length === 0) {
        throw new Error('User not found');
      }
      
      // Check if tax profile for this fiscal year already exists
      const [existingProfiles] = await pool.query(
        'SELECT id FROM tax_profiles WHERE user_id = ? AND fiscal_year = ?',
        [userId, fiscalYear]
      );
      
      if (existingProfiles.length > 0) {
        throw new Error(`Tax profile for fiscal year ${fiscalYear} already exists for this user`);
      }
      
      // Calculate tax due
      const taxDue = await this.calculateTax(income, fiscalYear);
      
      // Create tax profile
      const [result] = await pool.query(
        'INSERT INTO tax_profiles (user_id, income, tax_due, fiscal_year) VALUES (?, ?, ?, ?)',
        [userId, income, taxDue, fiscalYear]
      );
      
      // Get the created profile
      const [profiles] = await pool.query(
        'SELECT * FROM tax_profiles WHERE id = ?',
        [result.insertId]
      );
      
      return profiles[0];
    } catch (error) {
      throw error;
    }
  }
  
  // Get tax profile by ID
  async getTaxProfileById(id) {
    try {
      const [profiles] = await pool.query(
        'SELECT * FROM tax_profiles WHERE id = ?',
        [id]
      );
      
      if (profiles.length === 0) {
        throw new Error('Tax profile not found');
      }
      
      return profiles[0];
    } catch (error) {
      throw error;
    }
  }
  
  // Get all tax profiles for a user
  async getUserTaxProfiles(userId) {
    try {
      const [profiles] = await pool.query(
        'SELECT * FROM tax_profiles WHERE user_id = ? ORDER BY fiscal_year DESC',
        [userId]
      );
      
      return profiles;
    } catch (error) {
      throw error;
    }
  }
  
  // Get current year tax profile for a user
  async getCurrentTaxProfile(userId, fiscalYear = '2023-2024') {
    try {
      const [profiles] = await pool.query(
        'SELECT * FROM tax_profiles WHERE user_id = ? AND fiscal_year = ?',
        [userId, fiscalYear]
      );
      
      if (profiles.length === 0) {
        return null;
      }
      
      return profiles[0];
    } catch (error) {
      throw error;
    }
  }
  
  // Update tax profile after payment
  async updateTaxPaid(id, amountPaid) {
    try {
      const profile = await this.getTaxProfileById(id);
      
      const newTaxPaid = parseFloat(profile.tax_paid) + parseFloat(amountPaid);
      const status = newTaxPaid >= parseFloat(profile.tax_due) ? 'paid' : 'partially_paid';
      
      const [result] = await pool.query(
        'UPDATE tax_profiles SET tax_paid = ?, status = ? WHERE id = ?',
        [newTaxPaid, status, id]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('Tax profile not found');
      }
      
      return await this.getTaxProfileById(id);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new TaxProfileModel(); 