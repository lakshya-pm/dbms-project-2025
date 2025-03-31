const express = require('express');
const router = express.Router();
const userModel = require('../models/userModel');

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide name, email, and password' 
      });
    }
    
    const user = await userModel.register({ name, email, password, role });
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: user
    });
  } catch (error) {
    if (error.message === 'User with this email already exists') {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }
    
    console.error('Error in user registration:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password' 
      });
    }
    
    const user = await userModel.login(email, password);
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: user
    });
  } catch (error) {
    if (error.message === 'Invalid email or password') {
      return res.status(401).json({
        success: false,
        message: error.message
      });
    }
    
    console.error('Error in user login:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// Get user profile
router.get('/profile/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await userModel.getUserById(userId);
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
});

// Update user profile
router.put('/profile/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email } = req.body;
    
    if (!name && !email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name or email to update'
      });
    }
    
    const updatedUser = await userModel.updateProfile(userId, { name, email });
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.message === 'Email is already in use by another user') {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }
    
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
});

// Change password
router.post('/change-password/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide old and new passwords'
      });
    }
    
    await userModel.changePassword(userId, oldPassword, newPassword);
    
    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.message === 'Current password is incorrect') {
      return res.status(401).json({
        success: false,
        message: error.message
      });
    }
    
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while changing password'
    });
  }
});

// Get all taxpayers (admin only)
router.get('/taxpayers', async (req, res) => {
  try {
    // This should have authorization middleware to check admin role
    const taxpayers = await userModel.getAllTaxpayers();
    
    res.status(200).json({
      success: true,
      data: taxpayers
    });
  } catch (error) {
    console.error('Error fetching taxpayers:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching taxpayers'
    });
  }
});

module.exports = router; 