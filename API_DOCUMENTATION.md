# API Documentation

## Base URL
```
http://localhost:3000
```

> **Note:** Port dapat disesuaikan melalui environment variable `PORT`. Default: 3000

---

## 🔔 Important Updates (v2.0)

### Breaking Changes in Order API

**Changed:** Order creation no longer accepts `price_amount` in request body.

**Before (v1.0):**
```json
{
  "price_amount": 50000,
  "ticketQuantity": 2
}
```

**Now (v2.0):**
```json
{
  "ticketQuantity": 2
}
```

**Why?** 
- **Security**: Fixed ticket price (Rp 20,000) enforced by backend
- **Consistency**: Prevents price manipulation from frontend
- **Simplicity**: Frontend only sends quantity, backend calculates total

### New Features

✅ **Automatic Webhook Integration**
- Real-time order status updates from Midtrans
- No manual status checking required
- Automatic ticket code generation

✅ **Fixed Ticket Pricing**
- **Rp 20,000 per ticket** (backend enforced)
- Total price: `20,000 × ticketQuantity`

✅ **Ticket Code Generation**
- Auto-generated upon successful payment
- Format: `TIX-{timestamp}-{random}`
- Example: `TIX-MHX6REEH-Z1EZ1D`

---

## Table of Contents
1. [Authentication](#authentication)
2. [Public Endpoints](#public-endpoints)
3. [User Endpoints (Authenticated)](#user-endpoints-authenticated)
   - [Orders](#orders)
   - [Chat](#chat)
4. [Admin Endpoints (Admin Only)](#admin-endpoints-admin-only)
   - [Articles](#articles-admin)
   - [Periods](#periods-admin)
5. [Webhook Endpoints](#webhook-endpoints)
6. [Error Responses](#error-responses)
7. [Data Models](#data-models)
8. [Notes](#notes)

---

## API Endpoints Summary

### Public Endpoints (No Authentication)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user account |
| POST | `/login` | Login with email and password |
| POST | `/google-login` | Login with Google OAuth |
| GET | `/pub/articles` | Get all articles (public) |
| GET | `/pub/articles/:id` | Get article by ID (public) |
| GET | `/pub/periods` | Get all periods (public) |
| POST | `/orders/webhook` | Midtrans payment webhook (called by Midtrans) |

### User Endpoints (Authentication Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/orders` | Create order and initiate payment |
| GET | `/orders/:id/status` | Get order payment status |
| POST | `/chat` | Send message to AI chatbot |

### Admin Endpoints (Authentication + Admin Role Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/articles` | Get all articles (admin) |
| GET | `/articles/:id` | Get article by ID (admin) |
| POST | `/articles` | Create new article |
| PUT | `/articles/:id` | Update article |
| DELETE | `/articles/:id` | Delete article |
| PATCH | `/articles/upload/:id` | Upload article image |
| GET | `/periods` | Get all periods (admin) |
| POST | `/periods` | Create new period |
| PUT | `/periods/:id` | Update period |
| DELETE | `/periods/:id` | Delete period |

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

**Request Body Fields:**
- `email` (string, required) - User email address (must be unique)
- `password` (string, required) - User password (will be hashed automatically)
- `fullName` (string, required) - Full name of the user
- `role` (string, optional) - User role, either "admin" or "user" (default: "user")

**Response (201 - Created):**
```json
{
  "message": "Success create new user",
  "email": "user@example.com"
}
```

**Response (400 - Bad Request):**
```json
{
  "message": "Email is required"
}
```

or

```json
{
  "message": "email must be unique"
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

**Validation:**
- Email is required
- Password is required
- Both fields cannot be empty

**Response (200 - OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (401 - Unauthorized):**
```json
{
  "message": "Invalid email or password"
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

**Important Notes:**
- Ticket price is fixed at **Rp 20,000 per ticket** (calculated by backend)
- No need to send `price_amount` in request body
- Total price is automatically calculated: `20,000 × ticketQuantity`

**Request Body:**
```json
{
  "ticketQuantity": 2,
  "museumName": "National Museum",
  "visitDate": "2025-12-01"
}
```

**Request Body Fields:**
- `ticketQuantity` (integer, required) - Number of tickets to purchase (minimum: 1)
- `museumName` (string, optional) - Name of the museum
- `visitDate` (date, optional) - Date of visit

**Response (201 - Created):**
```json
{
  "message": "Order created, Midtrans transaction created",
  "order": {
    "id": 1,
    "UserId": 1,
    "price_amount": 40000,
    "ticketQuantity": 2,
    "museumName": "National Museum",
    "visitDate": "2025-12-01",
    "status": "pending",
    "midtrans_orderId": "ORDER-1-1699999999999",
    "qrString": null,
    "ticketCode": null,
    "paidAt": null,
    "expiredAt": null,
    "createdAt": "2025-11-12T00:00:00.000Z",
    "updatedAt": "2025-11-12T00:00:00.000Z"
  },
  "ticketPrice": 20000,
  "totalPrice": 40000,
  "midtrans": {
    "token": "midtrans_snap_token_here",
    "redirect_url": "https://app.sandbox.midtrans.com/snap/v2/vtweb/..."
  }
}
```

**Example Frontend Usage:**
```javascript
// Frontend displays price calculation
const ticketPrice = 20000;
const quantity = 2;
const totalPrice = ticketPrice * quantity; // 40000

// Send request
const response = await fetch('/orders', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    ticketQuantity: quantity,
    museumName: 'National Museum',
    visitDate: '2025-12-01'
  })
});

// Use midtrans.token for Snap payment
const { midtrans } = await response.json();
window.snap.pay(midtrans.token);
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
    "gross_amount": "40000.00",
    "payment_type": "credit_card",
    "transaction_time": "2025-11-12 10:00:00",
    "transaction_status": "settlement",
    "fraud_status": "accept"
  },
  "order": {
    "id": 1,
    "UserId": 1,
    "price_amount": 40000,
    "ticketQuantity": 2,
    "museumName": "National Museum",
    "visitDate": "2025-12-01",
    "status": "paid",
    "midtrans_orderId": "ORDER-1-1699999999999",
    "ticketCode": "TIX-MHX6REEH-Z1EZ1D",
    "paidAt": "2025-11-12T10:00:00.000Z",
    "createdAt": "2025-11-12T00:00:00.000Z",
    "updatedAt": "2025-11-12T10:00:00.000Z"
  }
}
```

**Possible Order Status:**
- `pending` - Payment not yet completed
- `paid` - Payment successful (includes `ticketCode` and `paidAt`)
- `cancelled` - Payment cancelled or denied
- `expired` - Payment expired
- `used` - Ticket has been used (future feature)

**Note:** The `/orders/:id/status` endpoint checks the current status from Midtrans and automatically updates the local database. If the transaction is not found in Midtrans (404), it returns a special response indicating the transaction may still be processing.

**Response (200 - Transaction Not Found):**
```json
{
  "message": "Transaction not found in Midtrans (may still be processing)",
  "order": {
    "id": 1,
    "UserId": 1,
    "status": "pending",
    ...
  },
  "midtrans": {
    "status": "not_found"
  }
}
```

---

#### 3. Midtrans Webhook (Internal)
This endpoint is called automatically by Midtrans server after payment status changes. **Not meant to be called directly by frontend.**

**Endpoint:** `POST /orders/webhook`

**Authentication:** Not required (verified using signature)

**Purpose:**
- Automatically updates order status when payment is completed
- Generates ticket code when payment is successful
- Updates `paidAt`, `expiredAt` timestamps

**Request Body (sent by Midtrans):**
```json
{
  "transaction_time": "2025-11-13 10:00:00",
  "transaction_status": "settlement",
  "transaction_id": "...",
  "status_message": "midtrans payment notification",
  "status_code": "200",
  "signature_key": "...",
  "payment_type": "credit_card",
  "order_id": "ORDER-1-1699999999999",
  "merchant_id": "...",
  "gross_amount": "40000.00",
  "fraud_status": "accept",
  "currency": "IDR"
}
```

**Security:**
- Uses SHA512 signature verification
- Validates request is from Midtrans server
- Formula: `SHA512(order_id + status_code + gross_amount + server_key)`

**Response (200 - OK):**
```json
{
  "message": "Webhook processed successfully"
}
```

**Setup Instructions:**
1. Login to Midtrans Dashboard
2. Go to Settings → Configuration
3. Set **Notification URL**: `https://your-domain.com/orders/webhook`
4. Save configuration

**Transaction Status Mapping:**
- `settlement` or `capture` → Order status: `paid` + Generate ticket code
- `pending` → Order status: `pending`
- `deny` or `cancel` → Order status: `cancelled`
- `expire` → Order status: `expired`

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
  "summary": "Article summary (optional)",
  "content": "Article content here...",
  "PeriodId": 1
}
```

**Request Body Fields:**
- `title` (string, required) - Article title
- `summary` (string, optional) - Short summary of the article
- `content` (text, required) - Full article content
- `PeriodId` (integer, required) - ID of the associated period

**Response (201 - Created):**
```json
{
  "id": 2,
  "title": "New Article Title",
  "summary": "Article summary (optional)",
  "content": "Article content here...",
  "PeriodId": 1,
  "UserId": 1,
  "imageUrl": null,
  "updatedAt": "2025-11-12T10:00:00.000Z",
  "createdAt": "2025-11-12T10:00:00.000Z"
}
```

**Response (400 - Bad Request):**
```json
{
  "message": "title cannot be null"
}
```

or

```json
{
  "message": "Invalid input"
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
  "summary": "Updated summary",
  "content": "Updated article content here...",
  "PeriodId": 1
}
```

**Request Body Fields:**
- `title` (string, required) - Updated article title
- `summary` (string, optional) - Updated summary
- `content` (text, required) - Updated article content
- `PeriodId` (integer, required) - ID of the associated period

**Response (200 - OK):**
```json
{
  "id": 1,
  "title": "Updated Article Title",
  "summary": "Updated summary",
  "content": "Updated article content here...",
  "imageUrl": "https://example.com/image.jpg",
  "UserId": 1,
  "PeriodId": 1,
  "createdAt": "2025-11-12T00:00:00.000Z",
  "updatedAt": "2025-11-12T11:00:00.000Z"
}
```

**Response (404 - Not Found):**
```json
{
  "message": "Data not found"
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

#### 4. Delete Period
Delete an existing period.

**Endpoint:** `DELETE /periods/:id`

**Authentication:** Required (Admin only)

**URL Parameters:**
- `id` (integer) - Period ID

**Response (200 - OK):**
```json
{
  "message": "Period deleted successfully"
}
```

**Response (404 - Not Found):**
```json
{
  "message": "Data not found"
}
```

---

## Webhook Endpoints

### Midtrans Payment Webhook

**Important:** This endpoint is designed to be called by Midtrans server only, not by frontend applications.

**Endpoint:** `POST /orders/webhook`

**Authentication:** Not required (uses signature verification instead)

**Purpose:**
- Receives automatic payment status notifications from Midtrans
- Updates order status in real-time when payment completes
- Generates ticket code automatically upon successful payment

**Request Body (sent by Midtrans):**
```json
{
  "transaction_time": "2025-11-13 10:00:00",
  "transaction_status": "settlement",
  "transaction_id": "abc123-xyz789",
  "status_message": "midtrans payment notification",
  "status_code": "200",
  "signature_key": "abc123...xyz789",
  "payment_type": "credit_card",
  "order_id": "ORDER-1-1699999999999",
  "merchant_id": "G000000000",
  "gross_amount": "40000.00",
  "fraud_status": "accept",
  "currency": "IDR"
}
```

**Response (200 - OK):**
```json
{
  "message": "Webhook processed successfully"
}
```

**Security Features:**
1. **Signature Verification**: Uses SHA512 hash to verify request authenticity
2. **Formula**: `SHA512(order_id + status_code + gross_amount + server_key)`
3. **Validation**: Rejects requests with invalid signatures (403 Forbidden)

**Transaction Status Handling:**

| Midtrans Status | Order Status Updated | Actions |
|-----------------|---------------------|---------|
| `settlement` | `paid` | Set `paidAt`, generate `ticketCode` |
| `capture` (with fraud_status='accept') | `paid` | Set `paidAt`, generate `ticketCode` |
| `pending` | `pending` | No action |
| `deny` | `cancelled` | No ticket code generated |
| `cancel` | `cancelled` | No ticket code generated |
| `expire` | `expired` | Set `expiredAt` |

**Error Responses:**

403 - Invalid Signature:
```json
{
  "message": "Invalid signature"
}
```

404 - Order Not Found:
```json
{
  "message": "Order not found"
}
```

**Setup Instructions:**

1. **Login to Midtrans Dashboard**
   - Sandbox: https://dashboard.sandbox.midtrans.com
   - Production: https://dashboard.midtrans.com

2. **Configure Notification URL**
   - Go to: Settings → Configuration
   - Set **Notification URL**: `https://your-domain.com/orders/webhook`
   - Save configuration

3. **Testing Webhook (Development)**
   - Use ngrok or localtunnel to expose localhost
   - Update Notification URL with public URL
   - Or use the provided test script: `test-webhook-complete.js`

**Example Test Script Usage:**
```bash
# Make sure server is running
npm start

# In another terminal, run test script
node test-webhook-complete.js
```

---

## Error Responses

### Common Error Responses

All error responses follow this format:
```json
{
  "message": "Error description"
}
```

### HTTP Status Codes

| Status Code | Meaning | When Used |
|-------------|---------|-----------|
| 200 | OK | Successful GET, PUT, PATCH requests |
| 201 | Created | Successful POST requests (resource created) |
| 400 | Bad Request | Invalid input, missing required fields, validation errors |
| 401 | Unauthorized | Missing/invalid token, wrong credentials |
| 403 | Forbidden | Valid token but insufficient permissions (not admin) |
| 404 | Not Found | Resource not found (article, period, order, etc.) |
| 413 | Payload Too Large | Request body exceeds size limit |
| 500 | Internal Server Error | Unexpected server error |

---

### Detailed Error Examples

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
  "message": "Please input email or password"
}
```

or

```json
{
  "message": "Message is too long. Maximum 1000 characters"
}
```

or

```json
{
  "message": "ticketQuantity must be at least 1"
}
```

or

```json
{
  "message": "File is required"
}
```

or

```json
{
  "message": "File size is too large"
}
```

or

```json
{
  "message": "Invalid input"
}
```

---

#### 401 - Unauthorized
Missing or invalid authentication token.

```json
{
  "message": "Please login first"
}
```

or

```json
{
  "message": "Invalid email or password"
}
```

or

```json
{
  "message": "Token has expired, please login again"
}
```

or

```json
{
  "message": "Invalid Google token"
}
```

---

#### 403 - Forbidden
User does not have permission to access the resource (not an admin).

```json
{
  "message": "You dont have any access"
}
```

or (for webhook with invalid signature)

```json
{
  "message": "Invalid signature"
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
  "message": "Internal Server Error"
}
```

or (for payment gateway errors)

```json
{
  "message": "Payment gateway error"
}
```

---

#### 413 - Payload Too Large
Request body is too large.

```json
{
  "message": "Request body is too large"
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
  price_amount: integer (calculated as: 20000 × ticketQuantity)
  midtrans_orderId: string (nullable)
  qrString: text (nullable, reserved for future QR code feature)
  ticketCode: string (nullable, auto-generated when payment is successful)
  status: string ("pending" | "paid" | "cancelled" | "expired" | "used")
  paidAt: datetime (nullable, set when payment is successful)
  expiredAt: datetime (nullable, set when payment expires)
  museumName: string (nullable)
  visitDate: datetime (nullable)
  ticketQuantity: integer (default: 1, minimum: 1)
  createdAt: datetime
  updatedAt: datetime
}
```

**Order Status Lifecycle:**
```
pending → paid (payment successful via webhook)
       → cancelled (payment denied/cancelled)
       → expired (payment timeout)
       → used (ticket used - future feature)
```

**Ticket Code Format:**
- Generated when payment is successful
- Format: `TIX-{timestamp}-{random}` 
- Example: `TIX-MHX6REEH-Z1EZ1D`

---

## Notes

### Authentication
- Most endpoints require JWT authentication
- Include the token in the Authorization header: `Bearer <token>`
- Token is obtained from `/login`, `/register`, or `/google-login` endpoints
- Token payload contains: `{ id, email, role }`
- Tokens do not expire by default (consider implementing expiration for production)

### Request/Response Format
- All requests and responses use JSON format
- Content-Type header: `application/json`
- Exception: Image upload endpoints use `multipart/form-data`
- All datetime fields are in ISO 8601 format (UTC)

### Authorization
- Admin-only endpoints require `role: "admin"` in the user profile
- Regular users cannot access admin endpoints
- Admin endpoints return `403 Forbidden` if accessed by non-admin users
- Authorization middleware checks user role after authentication

### File Upload
- Image upload uses ImageKit service
- Supported formats: JPG, PNG, and other common image formats
- Maximum file size depends on server configuration and Multer settings
- Uses multipart/form-data encoding
- File field name must be `file`
- Returns ImageKit CDN URL after successful upload

### Payment Integration
- Orders use Midtrans payment gateway
- Support for multiple payment methods through Midtrans
- **Fixed ticket price: Rp 20,000 per ticket**
- Total price calculated automatically by backend: `20,000 × ticketQuantity`
- Transaction status can be checked via the status endpoint
- **Webhook integration** for automatic order status updates
- Ticket code automatically generated upon successful payment

**Payment Flow:**
1. User creates order → receives Snap token
2. User pays via Midtrans Snap
3. Midtrans sends webhook notification to backend
4. Backend automatically updates order status and generates ticket code
5. Frontend can poll order status or listen for updates

### AI Chat
- Powered by Google Gemini AI
- Maximum message length: 1000 characters
- Requires user authentication
- Returns AI-generated responses based on user input
- Includes timestamp in response
- Logs chat requests for monitoring purposes

### Database
- Uses PostgreSQL as the database
- Sequelize ORM for database operations
- Supports migrations and seeders for database management
- Foreign key constraints enabled for data integrity

### CORS
- CORS enabled for all origins (development)
- Adjust CORS settings for production environment

---

## Environment Variables Required

```env
# Server Configuration
PORT=3000
NODE_ENV=development

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
```

---

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL database
- npm or yarn package manager

### Installation Steps

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env` file (see Environment Variables section)

3. Create PostgreSQL database:
```bash
createdb your_database_name
```

4. Run migrations:
```bash
npx sequelize-cli db:migrate
```

5. Run seeders (optional):
```bash
npx sequelize-cli db:seed:all
```

6. Start the server:
```bash
npm start
```

The API will be available at `http://localhost:3000`

---

## Project Structure

```
I-Project_Server/
├── __test__/              # Test files
│   ├── admin-articles.test.js
│   ├── admin-periods.test.js
│   ├── auth.test.js
│   ├── chat.test.js
│   ├── orders.test.js
│   ├── public-articles.test.js
│   ├── public-periods.test.js
│   └── setup.js
├── bin/
│   └── www.js            # Server entry point
├── config/
│   └── config.json       # Database configuration
├── controllers/          # Request handlers
│   ├── articleController.js
│   ├── chatController.js
│   ├── loginRegisterController.js
│   ├── orderController.js
│   ├── periodController.js
│   └── uploadimageController.js
├── data/                 # JSON data files
├── helpers/              # Helper functions
│   ├── bcrypt.js         # Password hashing
│   ├── gemini.js         # AI integration
│   ├── jwt.js            # Token management
│   └── midtransSignature.js  # Webhook signature verification
├── middlewares/          # Express middlewares
│   ├── authentication.js # JWT authentication
│   ├── authorization.js  # Role-based access control
│   └── errorHandler.js   # Centralized error handling
├── migrations/           # Database migrations
├── models/               # Sequelize models
│   ├── article.js
│   ├── order.js
│   ├── period.js
│   ├── user.js
│   └── index.js
├── routes/               # API routes
│   ├── article.js
│   ├── chat.js
│   ├── order.js
│   ├── period.js
│   └── index.js          # Main router
├── seeders/              # Database seeders
├── utility/              # Utility functions
│   ├── imageKit.js       # ImageKit integration
│   └── multer.js         # File upload configuration
├── app.js                # Express app configuration
├── package.json          # Dependencies and scripts
└── API_DOCUMENTATION.md  # This file
```

---

## Development Tips

### Testing API Endpoints
You can test the API using:
- **Postman** - GUI-based API testing tool
- **Thunder Client** - VS Code extension for API testing
- **curl** - Command-line tool
- **Supertest** - For automated testing (already configured)

### Common Development Issues

**Issue: "Please login first" error**
- Solution: Make sure to include the Authorization header with a valid token
- Format: `Authorization: Bearer YOUR_TOKEN_HERE`

**Issue: "You dont have any access" error**
- Solution: The endpoint requires admin role. Check your user's role in the database

**Issue: "Transaction not found in Midtrans"**
- Solution: This is normal for newly created orders. The transaction may still be processing

**Issue: Order status not updating automatically**
- Solution: Make sure Midtrans webhook is properly configured with your public URL
- For local development, use ngrok or similar tool to expose localhost

### Database Migrations
```bash
# Create new migration
npx sequelize-cli migration:generate --name migration-name

# Run pending migrations
npx sequelize-cli db:migrate

# Undo last migration
npx sequelize-cli db:migrate:undo

# Reset database
npx sequelize-cli db:migrate:undo:all
```

### Database Seeders
```bash
# Create new seeder
npx sequelize-cli seed:generate --name seeder-name

# Run all seeders
npx sequelize-cli db:seed:all

# Undo all seeders
npx sequelize-cli db:seed:undo:all
```

### Logging
The server logs important events including:
- Chat requests and responses
- Order creation and status updates
- Webhook notifications from Midtrans
- Authentication errors
- General errors and stack traces (in development)

---

## Production Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use production Midtrans credentials (`isProduction: true`)
- [ ] Configure proper CORS settings (restrict origins)
- [ ] Set up SSL/HTTPS
- [ ] Configure Midtrans webhook with production URL
- [ ] Implement JWT token expiration
- [ ] Set up proper logging and monitoring
- [ ] Configure database connection pooling
- [ ] Set appropriate request size limits
- [ ] Enable rate limiting
- [ ] Secure environment variables
- [ ] Set up database backups

---

## Testing

Run tests with:
```bash
npm test
```

Test files are located in the `__test__/` directory.

**Available Test Suites:**
- `admin-articles.test.js` - Tests for admin article endpoints
- `admin-periods.test.js` - Tests for admin period endpoints
- `auth.test.js` - Tests for authentication endpoints
- `chat.test.js` - Tests for chat endpoints
- `orders.test.js` - Tests for order and payment endpoints
- `public-articles.test.js` - Tests for public article endpoints
- `public-periods.test.js` - Tests for public period endpoints

**Test Configuration:**
- Uses Jest testing framework
- Supertest for HTTP assertions
- Setup file: `__test__/setup.js`
- Test environment: Node.js
- Tests run with `--detectOpenHandles` and `--forceExit` flags

### Testing Webhook (Development)

To test the Midtrans webhook in development environment:

**Option 1: Use Test Script**
```bash
# Make sure server is running
npm start

# In another terminal
node test-webhook-complete.js
```

**Option 2: Use Postman/Thunder Client**
1. Generate webhook payload using helper:
```javascript
const { generateWebhookPayload } = require('./helpers/midtransSignature');
const payload = generateWebhookPayload('ORDER-1-123', '40000.00', 'settlement');
```

2. Send POST request to `http://localhost:3000/orders/webhook` with the generated payload

**Option 3: Use ngrok for Real Webhook**
```bash
# Install ngrok (if not installed)
npm install -g ngrok

# Expose local server
ngrok http 3000

# Use ngrok URL in Midtrans Dashboard
# Example: https://abc123.ngrok.io/orders/webhook
```

---

## Order & Payment Flow Summary

### Complete User Journey

```
1. 🛒 USER SELECTS TICKETS
   Frontend: User selects quantity (e.g., 3 tickets)
   Display: 3 × Rp 20.000 = Rp 60.000

2. 🔐 CREATE ORDER
   POST /orders
   {
     "ticketQuantity": 3,
     "museumName": "Museum Nasional",
     "visitDate": "2025-12-01"
   }
   
   Response: { midtrans: { token, redirect_url } }

3. 💳 PAYMENT
   Frontend: Open Midtrans Snap with token
   User: Complete payment in Snap interface

4. 🔔 WEBHOOK (Automatic)
   Midtrans → POST /orders/webhook
   Backend: 
   - Verify signature
   - Update order status → 'paid'
   - Generate ticketCode
   - Set paidAt timestamp

5. ✅ CONFIRMATION
   Frontend: Poll GET /orders/:id/status
   Display: Order paid, show ticketCode
```

### Security Features

1. **Backend Price Validation**
   - Price fixed at Rp 20,000 per ticket
   - Frontend cannot manipulate price
   - Total calculated by backend only

2. **Webhook Signature Verification**
   - SHA512 hash validation
   - Prevents unauthorized webhook calls
   - Ensures authenticity from Midtrans

3. **JWT Authentication**
   - Required for order creation
   - Protects user data
   - Role-based access control

---

## Additional Resources

### Related Documentation
- [Express.js Documentation](https://expressjs.com/)
- [Sequelize ORM Documentation](https://sequelize.org/)
- [Midtrans API Documentation](https://docs.midtrans.com/)
- [Google Gemini AI Documentation](https://ai.google.dev/)
- [ImageKit Documentation](https://docs.imagekit.io/)

### Useful Links
- GitHub Repository: https://github.com/sabianathallah/I-Project_Server
- Issue Tracker: https://github.com/sabianathallah/I-Project_Server/issues

### API Version History

**v2.0 (Current - November 2025)**
- Fixed ticket pricing (Rp 20,000 per ticket)
- Automatic webhook integration for order status
- Enhanced error handling
- Improved security with backend price validation
- Added ticket code auto-generation
- Better validation and error messages

**v1.0 (Initial Release)**
- Basic CRUD operations for articles and periods
- User authentication with JWT
- Google OAuth integration
- Order management with Midtrans
- AI chat integration

---

## Support & Contact

For issues, questions, or contributions:
1. Check the existing documentation
2. Review test files for usage examples
3. Open an issue on GitHub
4. Contact the development team

---

*Last updated: November 14, 2025*
