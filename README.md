# I-Project Server

Server backend untuk aplikasi I-Project menggunakan Node.js, Express, dan Sequelize dengan PostgreSQL.

## Database Schema

Proyek ini menggunakan 6 tabel utama sesuai dengan ERD:

### 1. Users
- `id` (INTEGER, PK)
- `fullName` (VARCHAR)
- `email` (VARCHAR, UNIQUE)
- `password` (VARCHAR)
- `role` (VARCHAR)
- `createdAt`, `updatedAt` (TIMESTAMP)

### 2. Museums
- `id` (INTEGER, PK)
- `name` (VARCHAR)
- `address` (VARCHAR)
- `openHour` (VARCHAR)
- `isActive` (BOOLEAN)
- `phone` (VARCHAR)
- `description` (TEXT)
- `createdAt`, `updatedAt` (TIMESTAMP)

### 3. Periods
- `id` (INTEGER, PK)
- `name_ofPeriod` (VARCHAR)
- `createdAt`, `updatedAt` (TIMESTAMP)

### 4. Articles
- `id` (INTEGER, PK)
- `title` (VARCHAR)
- `summary` (TEXT)
- `content` (TEXT)
- `imageUrl` (VARCHAR)
- `UserId` (INTEGER, FK → Users)
- `PeriodId` (INTEGER, FK → Periods)
- `createdAt`, `updatedAt` (TIMESTAMP)

### 5. Orders
- `id` (INTEGER, PK)
- `UserId` (INTEGER, FK → Users)
- `price_amount` (INTEGER)
- `midtrans_orderId` (VARCHAR)
- `qrString` (TEXT)
- `status` (VARCHAR)
- `paidAt` (TIMESTAMP)
- `expiredAt` (TIMESTAMP)
- `createdAt`, `updatedAt` (TIMESTAMP)

### 6. OrderItems
- `id` (INTEGER, PK)
- `orderId` (INTEGER, FK → Orders)
- `MuseumId` (INTEGER, FK → Museums)
- `visitDate` (DATE)
- `price` (INTEGER)
- `status` (VARCHAR)
- `ticketCode` (VARCHAR)
- `qr_token` (VARCHAR)
- `createdAt`, `updatedAt` (TIMESTAMP)

## Setup Database

### Konfigurasi Database
Edit file `config/config.json` sesuai dengan konfigurasi PostgreSQL Anda:

```json
{
  "development": {
    "username": "postgres",
    "password": "postgres",
    "database": "I-Project_db",
    "host": "127.0.0.1",
    "dialect": "postgres"
  }
}
```

### Menjalankan Migrasi

1. Pastikan PostgreSQL sudah terinstall dan berjalan
2. Buat database baru (jika belum ada):
   ```bash
   createdb I-Project_db
   ```

3. Jalankan migrasi untuk membuat semua tabel:
   ```bash
   npx sequelize-cli db:migrate
   ```

4. Untuk rollback migrasi terakhir:
   ```bash
   npx sequelize-cli db:migrate:undo
   ```

5. Untuk rollback semua migrasi:
   ```bash
   npx sequelize-cli db:migrate:undo:all
   ```

## Dependencies

- **express**: Web framework
- **sequelize**: ORM untuk PostgreSQL
- **pg**: PostgreSQL client
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT authentication
- **sequelize-cli**: CLI untuk migrasi Sequelize (dev dependency)

## Installation

```bash
npm install
```

## Running the Application

```bash
npm start
```

## Database Migrations

File migrasi tersimpan di folder `migrations/`:
- `20251112000001-create-users.js`
- `20251112000002-create-museums.js`
- `20251112000003-create-periods.js`
- `20251112000004-create-articles.js`
- `20251112000005-create-orders.js`
- `20251112000006-create-orderitems.js`

Urutan migrasi dirancang agar foreign key constraints terpenuhi dengan benar.
