# 🧠 Product Recommendation System - Server Side

Welcome to the **backend** of the **Product Recommendation System**!  
This Express.js + MongoDB-powered server manages all the database operations, query handling, recommendations, and secure API access using JWT.

---

## 🚀 Live Server (Hosted on Render)
> 🔗 https://product-recommendation-server-roan.vercel.app/

---

## 📌 Key Features

- Built with **Node.js**, **Express.js**, and **MongoDB**
- **JWT Authentication** for protected API access
- Handles **CRUD operations** for:
  - Product Queries (Create, Read, Update, Delete)
  - Recommendations (Create, Delete)
- **Incremental update** of recommendation count using MongoDB `$inc`
- Email-based user authorization for secure updates and deletions
- Error handling with appropriate status codes
- CORS enabled for client communication

---

## 📁 API Endpoints

### 🔐 Authentication
- `POST /jwt` – Generate JWT token after login

### 📚 Queries
- `GET /queries` – Get all queries (can limit or sort by recent)
- `GET /queries/:id` – Get specific query details
- `POST /queries` – Add a new query
- `PUT /update-query/:id` – Update a query
- `DELETE /delete-query/:id` – Delete a query
- `PUT /queries/recommend/:id` – Add recommendation & update count

### 💬 Recommendations
- `POST /recommendations` – Add a recommendation
- `GET /recommendations/:queryId` – Get all recommendations for a specific query
- `GET /recommendations/user/:email` – Get all recommendations made by user
- `GET /recommendations/for-me/:email` – Get recommendations made for user
- `DELETE /recommendations/:id` – Delete recommendation & decrease count

---

## 🔐 JWT Authentication

- Token is generated on login and verified for private routes
- Middleware: `verifyToken` checks valid token from headers

```js
Authorization: Bearer <token>
