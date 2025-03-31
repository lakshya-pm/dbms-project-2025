create database IncomeTaxDB;
USE IncomeTaxDB;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('taxpayer', 'admin') DEFAULT 'taxpayer'
);

CREATE TABLE taxpayer_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    income DECIMAL(10,2) NOT NULL,
    tax_paid DECIMAL(10,2) DEFAULT 0,
    tax_due DECIMAL(10,2) DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    amount DECIMAL(10,2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

select * from users;
