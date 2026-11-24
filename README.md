# EvercupPoints

A coffee shop loyalty membership web portal. Customers join through the website
and get a personal QR code — no app to download. Staff scan that code at the
counter to award points, and members redeem those points for rewards.

Built for ITEC 116 (Systems Integration and Architecture 2) by Jayzel Cantor,
BSIS 302, carrying forward the design from Laboratory Activities 03 to 06.

## Tech stack

| Layer | Technology |
|---|---|
| Backend framework | NestJS |
| ORM | TypeORM |
| Database | MySQL |
| Authentication | JWT (Passport) + bcrypt password hashing |
| Frontend (optional bonus) | React + Vite |
| API testing | Postman |

## Project structure

```
EvercupPoints/
├── backend/      NestJS REST API
│   └── src/
│       ├── auth/                  login, JWT strategy, role guard
│       ├── customers/             loyalty members
│       ├── staff-users/           staff and admin accounts
│       ├── rewards/               rewards catalog
│       ├── point-transactions/    points earned per purchase
│       ├── redemptions/           rewards claimed
│       └── common/filters/        standard error response
├── frontend/     React app (staff scanner, members, rewards, sign-up)
├── database/     MySQL schema export
└── postman/      Postman collection
```

## Running it locally

### 1. Database

Start MySQL in XAMPP, then create the database. Either import
`database/evercuppoints.sql` in phpMyAdmin, or just create an empty
database named `evercuppoints` — the backend creates the tables itself
on first run.

### 2. Backend

```bash
cd backend
npm install
copy .env.example .env      # macOS/Linux: cp .env.example .env
npm run seed                # creates the admin account and sample rewards
npm run start:dev
```

The API runs on http://localhost:3000/api/v1

Seeded logins:

| Username | Password | Role |
|---|---|---|
| admin | admin123 | Admin |
| cashier | cashier123 | Staff |

### 3. Frontend (optional)

```bash
cd frontend
npm install
npm run dev
```

The app runs on http://localhost:5173 and expects the backend on port 3000.

Camera scanning needs `localhost` or `https`. On `localhost` it works as is;
on any other host the browser blocks camera access without HTTPS.

## API

Every endpoint lives under `/api/v1`. Full request and response examples are in
the Postman collection at `postman/EvercupPoints.postman_collection.json`.

| Resource | Endpoints |
|---|---|
| `/auth` | login, profile |
| `/customers` | list, search, get, get by QR, point history, redemptions, register, PATCH, PUT, delete |
| `/rewards` | list, get, create, PUT, PATCH, delete |
| `/point-transactions` | list, get, award points |
| `/redemptions` | list, get, claim reward |
| `/staff-users` | list, get, create, update, delete |

### Access levels

- **Public** — registering as a member, browsing the rewards catalog, login
- **Authenticated** — reading members, point history and redemptions
- **Staff or Admin** — awarding points, claiming rewards
- **Admin only** — editing or deleting members, managing rewards and staff accounts

A request with no valid token is rejected with **401 Unauthorized**. A valid
token whose role is not allowed is rejected with **403 Forbidden**.

### Error format

Every error returns the same shape:

```json
{
  "success": false,
  "statusCode": 409,
  "message": "Receipt has already been claimed.",
  "errors": ["Points for receipt OR-2026-004901 were already awarded."],
  "timestamp": "2026-11-24T12:00:00.000Z"
}
```

## Design decisions worth noting

**Receipt numbers are unique.** `ReceiptNumber` carries a UNIQUE constraint, so
the same receipt can never award points twice. A repeat scan returns 409 Conflict.

**Points are calculated on the server.** The client sends the purchase amount,
never the points. One point is awarded per 10 pesos spent.

**The staff ID comes from the token.** Awarding points and claiming rewards record
who processed them from the JWT, not from the request body, so it cannot be faked.

**Points and records change together.** Awarding points and claiming rewards both
run inside a database transaction, so a record never exists without its matching
balance change.

**Point transactions and redemptions cannot be edited or deleted.** They are
permanent records. A mistake is corrected by adding a new entry.

**Password hashes never leave the server.** The staff service strips `passwordHash`
from every response.
