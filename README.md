# 📚 College Library Management System

A web-based application to manage library operations, including book issuing, returns, fine collection, and student management. Built specifically for Polytechnic Colleges.

## 🛠️ Tech Stack
* **Frontend:** React.js, Context API, CSS3
* **Backend:** Node.js, Express.js
* **Database:** MongoDB (Atlas/Local)
* **Authentication:** JWT (JSON Web Tokens)
* **Tools:** Axios, Chart.js, React-Toastify

## ✨ Features
* **3 User Roles:** Student, Staff, Admin.
* **Circulation:** Issue/Return books with auto-fine calculation.
* **Inventory:** Add books via form or CSV Bulk Upload.
* **Financials:** Track fines and send Email Receipts.
* **Security:** OTP Password Reset & Audit Logs.

## 🚀 How to Run Locally

### 1. Prerequisites
* Node.js installed
* MongoDB installed or Atlas Connection String

### 2. Installation
Clone the repository and install dependencies for **both** server and client.

```bash
# Install Root Dependencies
npm install

# Install Client Dependencies
cd client
npm install
cd ..