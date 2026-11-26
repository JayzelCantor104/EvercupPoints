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
├── frontend/     React app (staff scanner, members, rewards, sign-up, member card)
├── database/     MySQL schema export
└── postman/      Postman collection
```

## Running it locally

### 1. Database

Start MySQL in XAMPP, then choose one:

- **Recommended:** import `database/evercuppoints.sql` in phpMyAdmin. It creates
  the `evercuppoints` database with all five tables, their keys, the CHECK rules
  and a small set of demo data (three members, purchases and claims), so you can
  skip `npm run seed`. Importing **replaces** those tables, so do not import it
  over a database whose data you want to keep.
- **Empty start:** create an empty database named `evercuppoints`. The backend
  creates the tables on first run and `npm run seed` adds the logins and rewards.
  (TypeORM cannot create CHECK constraints on MySQL, so this route has the same
  rules enforced by the API only.)

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

### Testing with Postman

Import the collection, then right-click it > **Run collection**. Its 55 requests
run top to bottom in 7 folders (Auth, Customers, Rewards, Point Transactions,
Redemptions, Staff Users & Roles, Deletes & Integrity) with 91 tests:

- Login saves the JWT, and every request after it reuses the token.
- Each create saves its new ID (customer, QR code, reward, transaction,
  redemption, staff) for the requests that follow, so nothing is hardcoded.
- Every request checks its status code, and every error is checked for the
  standard error format.
- Each run uses fresh receipt numbers, emails and usernames, so it can be run
  again on the same database. It cleans up the member and reward it creates.
- Every request has a saved example response.

To run it against another address, change the `baseUrl` collection variable.

| Resource | Endpoints |
|---|---|
| `/auth` | login, profile |
| `/customers` | list, search, get, get by QR, point history, redemptions, register, open member card, resend card email, PATCH, PUT, delete |
| `/rewards` | list, get, create, PUT, PATCH, delete |
| `/point-transactions` | list, get, award points |
| `/redemptions` | list, get, claim reward |
| `/staff-users` | list, get, create, update, delete |

### Access levels

- **Public** — registering as a member, opening your own member card, browsing the rewards catalog, login
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

**Members open their card with two things, not one.** `POST /customers/card`
needs both the email and the member code from the QR. A wrong pair gets the same
401 message whichever part was wrong. It is a POST so the email never appears in
a URL.

**New members get their card by email.** On sign-up the server draws the QR
as a PNG and emails it through SMTP (Gmail works with an App Password, see
`backend/.env.example`). A mail failure never undoes the sign-up: the response
just says `"cardEmailed": false`. `POST /customers/card/resend` sends it again
for a member who lost their code, and gives the same reply whether or not the
email is registered.

**History is never deleted out from under you.** A reward that has been claimed,
or a staff account that has processed points, cannot be deleted. The API returns
409 Conflict and says to retire or deactivate it instead (`PATCH isActive: false`).

**Two requests at once are handled one at a time.** Awarding points and claiming
a reward lock the member's row until they finish, so two claims at the same
moment cannot both spend the same points. A receipt entered twice at the same
instant gets 409, never a 500.

**Password hashes never leave the server.** The staff service strips `passwordHash`
from every response.

**A token is only as good as the account behind it.** The JWT strategy re-checks
the staff account on every request, so deactivating or deleting a staff member
locks them out at once instead of when their token expires, and a role change
applies immediately. An admin cannot delete, deactivate or demote their own
account. The app refuses to start without `JWT_SECRET` in `.env`.

**Bad query values are a 400, not a crash.** Every list endpoint validates
`page` (from 1) and `limit` (1 to 100) before touching the database.
