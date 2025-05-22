# 💸 Digital Wallet System with Fraud Detection and Admin Reporting

- This project implements a virtual wallet system where users can deposit, withdraw, and transfer virtual currencies (USD, INR, EUR). It includes admin controls, fraud detection (real-time & scheduled), soft delete support, and reporting features.
---

## 🚀 Features

### ✅ User Features

- **Register/Login** with JWT-based authentication.
- **Wallet Management**:
  - Deposit virtual cash.
  - Withdraw virtual cash.
  - Transfer virtual cash to other users by email.
- **Transaction History**:
  - View all transactions.
- **Soft Deletion**:
  - Users and transactions can be soft-deleted (deactivated) without full data loss.

### 🔒 Middleware

- `verifyJWT`: Validates JWT and attaches user to request.
- `isAdmin`: Grants access to admin-only routes.

---

## 🛡️ Fraud Detection

### 🔍 Real-Time Fraud Checks

- **Multiple Transfers in Short Time**:
  - Flag transfers if a user sends more than `X` transfers within `Y` minutes.
- **Sudden Large Withdrawals**:
  - Flag withdrawals that exceed a currency-specific threshold.

### 🧠 Scheduled Daily Job

- Runs every day at midnight using `node-cron`.
- Scans last 24 hours of transactions for:
  - Multiple quick transfers.
  - Large withdrawals.

---

## 🧑‍💼 Admin APIs

All admin routes require `role: "admin"` on the authenticated user.

### User Management

- `GET /api/v1/admin/get-all-users`
- `POST /api/v1/admin/soft-delete-user/:userId`
- `GET /api/v1/admin/get-soft-deleted-users`

### Transaction Management

- `GET /api/v1/admin/get-all-transactions`
- `GET /api/v1/admin/get-flagged-transactions`
- `POST /api/v1/admin/soft-delete-transaction/:transactionId`
- `GET /api/v1/admin/get-soft-deleted-transactions`

### Reporting

- `GET /api/v1/admin/get-total-user-balances`
- `GET /api/v1/admin/get-top-users-by-balance`
- `GET /api/v1/admin/get-top-users-by-transactionvolume`

---

## 🧾 API Endpoints

### 👤 Auth Routes (`/api/v1/user`)

- `POST /register`
- `POST /login`
- `POST /logout`
- `POST /refresh-token`
- `GET /get-user`
- `PATCH /change-password`

### 💰 Wallet Routes (`/api/v1/wallet`)

- `GET /get-wallet`
- `POST /deposit`
- `POST /withdraw`
- `POST /transfer`

### 📜 Transaction Routes (`/api/v1/transaction`)

- `GET /get-transaction-history`

---

## 🗂️ Models

- User
- Wallet
- Transaction

---

## 🔧 Tech Stack

- **Backend**: Node.js, Express
- **Database**: MongoDB, Mongoose
- **Auth**: JWT, Cookies
- **Scheduler**: node-cron
- **Testing**: Postman
---

### .env Example:

```
PORT = 
MONGODB_URI = 
CORS_ORIGIN=*

ACCESS_TOKEN_SECRET= 
ACCESS_TOKEN_EXPIRY= 1d

REFRESH_TOKEN_SECRET= 
REFRESH_TOKEN_EXPIRY= 7d

```

### Run the server:

```npm
npm run dev
```

---
