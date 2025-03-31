const { pool } = require('../config/db');
const bcrypt = require('bcrypt');

class UserModel {
  // Register a new user
  async register(userData) {
    try {
      const { name, email, password, role = 'taxpayer' } = userData;
      
      // Check if user already exists
      const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
      if (existingUsers.length > 0) {
        throw new Error('User with this email already exists');
      }
      
      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      // Insert user into database
      const [result] = await pool.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, role]
      );
      
      return {
        id: result.insertId,
        name,
        email,
        role
      };
    } catch (error) {
      throw error;
    }
  }
  
  // Login user
  async login(email, password) {
    try {
      const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
      
      if (users.length === 0) {
        throw new Error('Invalid email or password');
      }
      
      const user = users[0];
      
      // Compare passwords
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        throw new Error('Invalid email or password');
      }
      
      // Return user without password
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      };
    } catch (error) {
      throw error;
    }
  }
  
  // Get user by ID
  async getUserById(id) {
    try {
      const [users] = await pool.query(
        'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
        [id]
      );
      
      if (users.length === 0) {
        throw new Error('User not found');
      }
      
      return users[0];
    } catch (error) {
      throw error;
    }
  }
  
  // Get all taxpayers (for admin)
  async getAllTaxpayers() {
    try {
      const [users] = await pool.query(
        'SELECT id, name, email, created_at FROM users WHERE role = "taxpayer"'
      );
      
      return users;
    } catch (error) {
      throw error;
    }
  }
  
  // Update user profile
  async updateProfile(id, userData) {
    try {
      const { name, email } = userData;
      
      // Check if email is already in use by another user
      if (email) {
        const [existingUsers] = await pool.query(
          'SELECT id FROM users WHERE email = ? AND id != ?',
          [email, id]
        );
        
        if (existingUsers.length > 0) {
          throw new Error('Email is already in use by another user');
        }
      }
      
      const updateFields = [];
      const values = [];
      
      if (name) {
        updateFields.push('name = ?');
        values.push(name);
      }
      
      if (email) {
        updateFields.push('email = ?');
        values.push(email);
      }
      
      if (updateFields.length === 0) {
        throw new Error('No fields to update');
      }
      
      values.push(id);
      
      const [result] = await pool.query(
        `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
        values
      );
      
      if (result.affectedRows === 0) {
        throw new Error('User not found');
      }
      
      return await this.getUserById(id);
    } catch (error) {
      throw error;
    }
  }
  
  // Change password
  async changePassword(id, oldPassword, newPassword) {
    try {
      const [users] = await pool.query('SELECT password FROM users WHERE id = ?', [id]);
      
      if (users.length === 0) {
        throw new Error('User not found');
      }
      
      const user = users[0];
      
      // Verify old password
      const match = await bcrypt.compare(oldPassword, user.password);
      if (!match) {
        throw new Error('Current password is incorrect');
      }
      
      // Hash new password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      
      // Update password
      await pool.query(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, id]
      );
      
      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new UserModel(); 