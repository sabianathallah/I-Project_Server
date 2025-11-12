# API Documentation

## Base URL
```
http://localhost:3000
```

---

## Table of Contents
1. [Authentication](#authentication)
2. [Public Endpoints](#public-endpoints)
3. [User Endpoints (Authenticated)](#user-endpoints-authenticated)
4. [Admin Endpoints (Admin Only)](#admin-endpoints-admin-only)
5. [Error Responses](#error-responses)

---

## Authentication

### 1. Register
Create a new user account.

**Endpoint:** `POST /register`

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "yourpassword",
  "fullName": "John Doe",
  "role": "user"
}
```

**Response (201 - Created):**
```json
{
  "message": "Success create new user",
  "email": "user@example.com"
}
```

---

### 2. Login
Login with email and password.

**Endpoint:** `POST /login`

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Response (200 - OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 3. Google Login
Login using Google OAuth.

**Endpoint:** `POST /google-login`

**Authentication:** Not required

**Request Body:**
```json
{
  "googleToken": "google_oauth_token_here"
}
```

**Response (200 - OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "fullName": "John Doe",
    "email": "user@example.com",
    "isMembership": false
  }
}
```

---

## Public Endpoints

### 1. Get All Articles (Public)
Get all articles without authentication.

**Endpoint:** `GET /pub/articles`

**Authentication:** Not required

**Response (200 - OK):**
```json
[
  {
    "id": 1,
    "title": "Article Title",
    "summary": "Article summary",
    "content": "Article content here...",
    "imageUrl": "https://example.com/image.jpg",
    "UserId": 1,
    "PeriodId": 1,
    "createdAt": "2025-11-12T00:00:00.000Z",
    "updatedAt": "2025-11-12T00:00:00.000Z",
    "User": {
      "id": 1,
      "fullName": "John Doe",
      "email": "user@example.com",
      "role": "admin"
    },
    "Period": {
      "id": 1,
      "name_ofPeriod": "Ancient Period"
    }
  }
]
```

---

### 2. Get Article by ID (Public)
Get a specific article by ID without authentication.

**Endpoint:** `GET /pub/articles/:id`

**Authentication:** Not required

**URL Parameters:**
- `id` (integer) - Article ID

**Response (200 - OK):**
```json
{
  "id": 1,
  "title": "Article Title",
  "summary": "Article summary",
  "content": "Article content here...",
  "imageUrl": "https://example.com/image.jpg",
  "UserId": 1,
  "PeriodId": 1,
  "createdAt": "2025-11-12T00:00:00.000Z",
  "updatedAt": "2025-11-12T00:00:00.000Z",
  "User": {
    "id": 1,
    "fullName": "John Doe",
    "email": "user@example.com",
    "role": "admin"
  },
  "Period": {
    "id": 1,
    "name_ofPeriod": "Ancient Period"
  }
}
```

---

### 3. Get All Periods (Public)
Get all periods without authentication.

**Endpoint:** `GET /pub/periods`

**Authentication:** Not required

**Response (200 - OK):**
```json
[
  {
    "id": 1,
    "name_ofPeriod": "Ancient Period",
    "createdAt": "2025-11-12T00:00:00.000Z",
    "updatedAt": "2025-11-12T00:00:00.000Z"
  }
]
```

---

## User Endpoints (Authenticated)

All endpoints in this section require authentication. Include the JWT token in the request header:
```
Authorization: Bearer <access_token>
```

### Orders

#### 1. Create Order
Create a new order and initiate Midtrans payment transaction.

**Endpoint:** `POST /orders`

**Authentication:** Required

**Request Body:**
```json
{
  "price_amount": 50000,
  "ticketQuantity": 2,
  "museumName": "National Museum",
  "visitDate": "2025-12-01"
}
```

**Response (201 - Created):**
```json
{
  "message": "Order created, Midtrans transaction created",
  "order": {
    "id": 1,
    "UserId": 1,
    "price_amount": 50000,
    "ticketQuantity": 2,
    "museumName": "National Museum",
    "visitDate": "2025-12-01",
    "status": "pending",
    "midtrans_orderId": "ORDER-1-1699999999999",
    "createdAt": "2025-11-12T00:00:00.000Z",
    "updatedAt": "2025-11-12T00:00:00.000Z"
  },
  "midtrans": {
    "token": "midtrans_snap_token_here",
    "redirect_url": "https://app.sandbox.midtrans.com/snap/v2/vtweb/..."
  }
}
```

---

#### 2. Get Order Status
Check order payment status and sync with Midtrans.

**Endpoint:** `GET /orders/:id/status`

**Authentication:** Required

**URL Parameters:**
- `id` (integer) - Order ID

**Response (200 - OK):**
```json
{
  "midtrans": {
    "status_code": "200",
    "status_message": "Success, transaction found",
    "transaction_id": "...",
    "order_id": "ORDER-1-1699999999999",
    "gross_amount": "50000.00",
    "payment_type": "credit_card",
    "transaction_time": "2025-11-12 10:00:00",
    "transaction_status": "settlement",
    "fraud_status": "accept"
  },
  "order": {
    "id": 1,
    "UserId": 1,
    "price_amount": 50000,
    "ticketQuantity": 2,
    "museumName": "National Museum",
    "visitDate": "2025-12-01",
    "status": "paid",
    "midtrans_orderId": "ORDER-1-1699999999999",
    "paidAt": "2025-11-12T10:00:00.000Z",
    "createdAt": "2025-11-12T00:00:00.000Z",
    "updatedAt": "2025-11-12T10:00:00.000Z"
  }
}
```

---

### Chat

#### 1. Chat with AI
Send a message to the AI chatbot (powered by Gemini AI).

**Endpoint:** `POST /chat`

**Authentication:** Required

**Request Body:**
```json
{
  "message": "Tell me about ancient Egyptian museums"
}
```

**Response (200 - OK):**
```json
{
  "message": "Success",
  "data": {
    "userMessage": "Tell me about ancient Egyptian museums",
    "aiResponse": "Ancient Egyptian museums are...",
    "timestamp": "2025-11-12T10:00:00.000Z"
  }
}
```

**Validation:**
- Message is required
- Maximum message length: 1000 characters

---

## Admin Endpoints (Admin Only)

All endpoints in this section require authentication AND admin role. Include the JWT token in the request header:
```
Authorization: Bearer <access_token>
```

### Articles (Admin)

#### 1. Get All Articles
Get all articles (admin view).

**Endpoint:** `GET /articles`

**Authentication:** Required (Admin only)

**Response (200 - OK):**
```json
[
  {
    "id": 1,
    "title": "Article Title",
    "summary": "Article summary",
    "content": "Article content here...",
    "imageUrl": "https://example.com/image.jpg",
    "UserId": 1,
    "PeriodId": 1,
    "createdAt": "2025-11-12T00:00:00.000Z",
    "updatedAt": "2025-11-12T00:00:00.000Z",
    "User": {
      "id": 1,
      "fullName": "John Doe",
      "email": "admin@example.com",
      "role": "admin"
    },
    "Period": {
      "id": 1,
      "name_ofPeriod": "Ancient Period"
    }
  }
]
```

---

#### 2. Get Article by ID
Get a specific article by ID (admin view).

**Endpoint:** `GET /articles/:id`

**Authentication:** Required (Admin only)

**URL Parameters:**
- `id` (integer) - Article ID

**Response (200 - OK):**
```json
{
  "id": 1,
  "title": "Article Title",
  "summary": "Article summary",
  "content": "Article content here...",
  "imageUrl": "https://example.com/image.jpg",
  "UserId": 1,
  "PeriodId": 1,
  "createdAt": "2025-11-12T00:00:00.000Z",
  "updatedAt": "2025-11-12T00:00:00.000Z",
  "User": {
    "id": 1,
    "fullName": "John Doe",
    "email": "admin@example.com",
    "role": "admin"
  },
  "Period": {
    "id": 1,
    "name_ofPeriod": "Ancient Period"
  }
}
```

---

#### 3. Create Article
Create a new article.

**Endpoint:** `POST /articles`

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "title": "New Article Title",
  "content": "Article content here...",
  "PeriodId": 1
}
```

**Response (201 - Created):**
```json
{
  "id": 2,
  "title": "New Article Title",
  "content": "Article content here...",
  "PeriodId": 1,
  "UserId": 1,
  "updatedAt": "2025-11-12T10:00:00.000Z",
  "createdAt": "2025-11-12T10:00:00.000Z"
}
```

---

#### 4. Update Article
Update an existing article.

**Endpoint:** `PUT /articles/:id`

**Authentication:** Required (Admin only)

**URL Parameters:**
- `id` (integer) - Article ID

**Request Body:**
```json
{
  "title": "Updated Article Title",
  "content": "Updated article content here...",
  "PeriodId": 1
}
```

**Response (200 - OK):**
```json
{
  "id": 1,
  "title": "Updated Article Title",
  "content": "Updated article content here...",
  "imageUrl": "https://example.com/image.jpg",
  "UserId": 1,
  "PeriodId": 1,
  "createdAt": "2025-11-12T00:00:00.000Z",
  "updatedAt": "2025-11-12T11:00:00.000Z"
}
```

---

#### 5. Upload Article Image
Upload an image for an article.

**Endpoint:** `PATCH /articles/upload/:id`

**Authentication:** Required (Admin only)

**URL Parameters:**
- `id` (integer) - Article ID

**Request Body:**
- Content-Type: `multipart/form-data`
- Field name: `file`
- Accepted formats: images (jpg, png, etc.)

**Response (200 - OK):**
```json
{
  "message": "Image uploaded successfully",
  "url": "https://ik.imagekit.io/your-imagekit/image.jpg"
}
```

---

#### 6. Delete Article
Delete an article.

**Endpoint:** `DELETE /articles/:id`

**Authentication:** Required (Admin only)

**URL Parameters:**
- `id` (integer) - Article ID

**Response (200 - OK):**
```json
{
  "message": "Article deleted successfully"
}
```

---

### Periods (Admin)

#### 1. Get All Periods
Get all periods (admin view).

**Endpoint:** `GET /periods`

**Authentication:** Required (Admin only)

**Response (200 - OK):**
```json
[
  {
    "id": 1,
    "name_ofPeriod": "Ancient Period",
    "createdAt": "2025-11-12T00:00:00.000Z",
    "updatedAt": "2025-11-12T00:00:00.000Z"
  }
]
```

---

#### 2. Create Period
Create a new period.

**Endpoint:** `POST /periods`

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "name_ofPeriod": "Medieval Period"
}
```

**Response (201 - Created):**
```json
{
  "id": 2,
  "name_ofPeriod": "Medieval Period",
  "updatedAt": "2025-11-12T10:00:00.000Z",
  "createdAt": "2025-11-12T10:00:00.000Z"
}
```

---

#### 3. Update Period
Update an existing period.

**Endpoint:** `PUT /periods/:id`

**Authentication:** Required (Admin only)

**URL Parameters:**
- `id` (integer) - Period ID

**Request Body:**
```json
{
  "name_ofPeriod": "Updated Period Name"
}
```

**Response (200 - OK):**
```json
{
  "id": 1,
  "name_ofPeriod": "Updated Period Name",
  "createdAt": "2025-11-12T00:00:00.000Z",
  "updatedAt": "2025-11-12T11:00:00.000Z"
}
```

---

## Error Responses

### Common Error Responses

#### 400 - Bad Request
Missing required fields or invalid input.

```json
{
  "message": "Email is required"
}
```

or

```json
{
  "message": "Message is too long. Maximum 1000 characters"
}
```

---

#### 401 - Unauthorized
Missing or invalid authentication token.

```json
{
  "message": "Invalid token"
}
```

or

```json
{
  "message": "User is not authenticated"
}
```

---

#### 403 - Forbidden
User does not have permission to access the resource (not an admin).

```json
{
  "message": "Forbidden"
}
```

---

#### 404 - Not Found
Requested resource not found.

```json
{
  "message": "Data not found"
}
```

or

```json
{
  "message": "Order not found"
}
```

---

#### 500 - Internal Server Error
Server encountered an unexpected error.

```json
{
  "message": "Internal server error"
}
```

---

## Data Models

### User
```typescript
{
  id: integer
  fullName: string
  email: string (unique)
  password: string (hashed)
  role: string ("admin" | "user")
  createdAt: datetime
  updatedAt: datetime
}
```

### Article
```typescript
{
  id: integer
  title: string
  summary: string (nullable)
  content: text
  imageUrl: string (nullable)
  UserId: integer (foreign key)
  PeriodId: integer (foreign key)
  createdAt: datetime
  updatedAt: datetime
}
```

### Period
```typescript
{
  id: integer
  name_ofPeriod: string
  createdAt: datetime
  updatedAt: datetime
}
```

### Order
```typescript
{
  id: integer
  UserId: integer (foreign key)
  price_amount: integer
  midtrans_orderId: string (nullable)
  qrString: text (nullable)
  ticketCode: string (nullable)
  status: string ("pending" | "paid" | "cancelled" | "expired" | "used")
  paidAt: datetime (nullable)
  expiredAt: datetime (nullable)
  museumName: string (nullable)
  visitDate: datetime (nullable)
  ticketQuantity: integer (default: 1)
  createdAt: datetime
  updatedAt: datetime
}
```

---

## Notes

### Authentication
- Most endpoints require JWT authentication
- Include the token in the Authorization header: `Bearer <token>`
- Token is obtained from `/login` or `/register` endpoints

### Authorization
- Admin-only endpoints require `role: "admin"` in the user profile
- Regular users cannot access admin endpoints

### File Upload
- Image upload uses ImageKit service
- Supported formats: JPG, PNG, and other common image formats
- Maximum file size depends on server configuration

### Payment Integration
- Orders use Midtrans payment gateway
- Support for multiple payment methods through Midtrans
- Transaction status can be checked via the status endpoint

### AI Chat
- Powered by Google Gemini AI
- Maximum message length: 1000 characters
- Requires user authentication

---

## Environment Variables Required

```env
# Database
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
DB_HOST=localhost
DB_DIALECT=postgres

# JWT
JWT_SECRET=your_jwt_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id

# Midtrans
MIDTRANS_SERVER_KEY=your_midtrans_server_key
MIDTRANS_CLIENT_KEY=your_midtrans_client_key

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# ImageKit
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint

# Environment
NODE_ENV=development
```

---

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env` file

3. Run migrations:
```bash
npx sequelize-cli db:migrate
```

4. Run seeders (optional):
```bash
npx sequelize-cli db:seed:all
```

5. Start the server:
```bash
npm start
```

The API will be available at `http://localhost:3000`

---

## Testing

Run tests with:
```bash
npm test
```

Test files are located in the `__test__/` directory.

---

*Last updated: November 12, 2025*
