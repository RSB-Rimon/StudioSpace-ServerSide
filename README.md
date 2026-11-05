# StudioSpace Backend

### RESTful API for StudioSpace

StudioSpace Backend is a REST API built with Node.js and Express.js. It handles studio listings, user authentication, and booking management using MongoDB as the database.

## ✨ Key Features

1. **JWT Authentication** – Protects private API routes using JWT verification.
2. **Studio Management** – Create, retrieve, update, and delete studio listings.
3. **User-Specific Studios** – Users can manage their own studio listings.
4. **Booking Management** – Create bookings and retrieve personal booking information.
5. **Secure API Routes** – Verifies authenticated users and restricts unauthorized access to protected resources.

## 🛠️ Technologies Used

- Node.js
- Express.js
- MongoDB
- MongoDB Native Driver
- Better Auth JWT
- JOSE
- CORS
- dotenv

## 📡 API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/add-studios` | Add a new studio |
| GET | `/exploreStudios` | Get all studios |
| GET | `/my-studios` | Get logged-in user's studios |
| GET | `/studios/:id` | Get studio details |
| PATCH | `/studios/:id` | Update a studio |
| DELETE | `/studios/:id` | Delete a studio |
| POST | `/booking` | Create a booking |
| GET | `/my-bookings` | Get logged-in user's bookings |











## 🌐 Deployment

The backend API is deployed using Vercel.

---

**StudioSpace Backend – Powering Creative Space Booking.**
