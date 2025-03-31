-- Income Tax Management System Database Schema

-- Create database
CREATE DATABASE IF NOT EXISTS income_tax_db;
USE income_tax_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('taxpayer', 'admin') DEFAULT 'taxpayer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tax profiles table
CREATE TABLE IF NOT EXISTS tax_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    income DECIMAL(12,2) NOT NULL,
    tax_due DECIMAL(10,2) NOT NULL,
    tax_paid DECIMAL(10,2) DEFAULT 0,
    fiscal_year VARCHAR(9) NOT NULL,
    status ENUM('pending', 'paid', 'partially_paid') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY user_fiscal_year (user_id, fiscal_year)
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    tax_profile_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_method ENUM('credit_card', 'bank_transfer', 'online_payment') NOT NULL,
    transaction_id VARCHAR(100),
    status ENUM('completed', 'pending', 'failed') DEFAULT 'completed',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (tax_profile_id) REFERENCES tax_profiles(id) ON DELETE CASCADE
);

-- Tax rates table for different income brackets
CREATE TABLE IF NOT EXISTS tax_rates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fiscal_year VARCHAR(9) NOT NULL,
    min_income DECIMAL(12,2) NOT NULL,
    max_income DECIMAL(12,2) DEFAULT NULL,
    rate DECIMAL(5,2) NOT NULL,
    UNIQUE KEY year_bracket (fiscal_year, min_income)
);

-- Insert default tax rates for 2023-2024
INSERT INTO tax_rates (fiscal_year, min_income, max_income, rate) VALUES
('2023-2024', 0, 50000, 10.00),
('2023-2024', 50001, 100000, 20.00),
('2023-2024', 100001, NULL, 30.00); 