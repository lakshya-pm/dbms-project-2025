# Income Tax Management System

A web application for managing income tax records and payments. This system allows taxpayers to register, log in, submit their income details, view their tax liabilities, and make payments.

## Features

- User authentication (registration and login)
- Income and tax calculation
- Tax payment processing
- View tax history and payment records
- Administrative features to manage taxpayers

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd income-tax-management-system
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure MySQL:
   - Make sure MySQL server is running
   - If you encounter authentication issues, run the following SQL commands:
     ```sql
     ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'LM2005';
     FLUSH PRIVILEGES;
     ```
   - Update database connection settings in `config/db.js` if needed

4. Initialize the database:
   ```
   npm run init-db
   ```

## Running the Application

1. Start the server:
   ```
   npm start
   ```

2. Access the application:
   - Frontend: `http://localhost:3000`
   - API: `http://localhost:3000/api`

## API Endpoints

### User Management
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login a user
- `GET /api/users/profile/:id` - Get user profile
- `PUT /api/users/profile/:id` - Update user profile
- `POST /api/users/change-password/:id` - Change user password
- `GET /api/users/taxpayers` - Get all taxpayers (admin only)

### Tax Profile Management
- `POST /api/tax-profiles` - Create a tax profile
- `GET /api/tax-profiles/:id` - Get a tax profile by ID
- `GET /api/tax-profiles/user/:userId` - Get all tax profiles for a user
- `GET /api/tax-profiles/user/:userId/current` - Get current fiscal year tax profile
- `POST /api/tax-profiles/calculate` - Calculate tax without creating a profile

### Payment Management
- `POST /api/payments` - Make a payment
- `GET /api/payments/:id` - Get a payment by ID
- `GET /api/payments/user/:userId` - Get all payments for a user
- `GET /api/payments/tax-profile/:taxProfileId` - Get payments for a tax profile
- `GET /api/payments/user/:userId/summary` - Get payment summary for a user

## Directory Structure

```
income-tax-management-system/
├── config/              # Configuration files
│   └── db.js            # Database configuration
├── frontend/            # Frontend files (HTML, CSS, JS)
├── models/              # Database models
│   ├── userModel.js
│   ├── taxProfileModel.js
│   └── paymentModel.js
├── routes/              # API routes
│   ├── userRoutes.js
│   ├── taxProfileRoutes.js
│   └── paymentRoutes.js
├── scripts/             # Utility scripts
│   └── initDb.js        # Database initialization script
├── database.sql         # SQL schema
├── server.js            # Main application file
├── package.json
└── README.md
```

## License

This project is licensed under the ISC License. 
