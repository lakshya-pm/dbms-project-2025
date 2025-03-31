const express = require('express');
const router = express.Router();
const taxProfileModel = require('../models/taxProfileModel');

// Create a tax profile
router.post('/', async (req, res) => {
  try {
    const { userId, income, fiscalYear } = req.body;
    
    // Validate input
    if (!userId || !income) {
      return res.status(400).json({
        success: false,
        message: 'Please provide userId and income'
      });
    }
    
    const taxProfile = await taxProfileModel.createTaxProfile(userId, income, fiscalYear);
    
    res.status(201).json({
      success: true,
      message: 'Tax profile created successfully',
      data: taxProfile
    });
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.message.includes('already exists for this user')) {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }
    
    console.error('Error creating tax profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating tax profile'
    });
  }
});

// Get a tax profile by ID
router.get('/:id', async (req, res) => {
  try {
    const taxProfileId = req.params.id;
    const profile = await taxProfileModel.getTaxProfileById(taxProfileId);
    
    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    if (error.message === 'Tax profile not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    console.error('Error fetching tax profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching tax profile'
    });
  }
});

// Get all tax profiles for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const profiles = await taxProfileModel.getUserTaxProfiles(userId);
    
    res.status(200).json({
      success: true,
      data: profiles
    });
  } catch (error) {
    console.error('Error fetching user tax profiles:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching tax profiles'
    });
  }
});

// Get current tax profile for a user
router.get('/user/:userId/current', async (req, res) => {
  try {
    const userId = req.params.userId;
    const fiscalYear = req.query.fiscalYear || '2023-2024';
    
    const profile = await taxProfileModel.getCurrentTaxProfile(userId, fiscalYear);
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: `No tax profile found for fiscal year ${fiscalYear}`
      });
    }
    
    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Error fetching current tax profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching current tax profile'
    });
  }
});

// Calculate tax for income without creating a profile
router.post('/calculate', async (req, res) => {
  try {
    const { income, fiscalYear } = req.body;
    
    if (!income) {
      return res.status(400).json({
        success: false,
        message: 'Please provide income'
      });
    }
    
    const taxDue = await taxProfileModel.calculateTax(income, fiscalYear);
    
    res.status(200).json({
      success: true,
      data: {
        income: parseFloat(income),
        taxDue,
        fiscalYear: fiscalYear || '2023-2024'
      }
    });
  } catch (error) {
    console.error('Error calculating tax:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while calculating tax'
    });
  }
});

module.exports = router; 