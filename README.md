# Chuks Kitchen Backend API

Backend implementation for the Chuks Kitchen Food Ordering and Customer Management System.

This project was built to satisfy the assignment requirements in `Project Overview.txt`, including:
- Backend flow design and logic modeling
- Working APIs for core product flows
- Edge-case handling
- Technical documentation and diagrams

## Project Scope
- User signup and OTP verification
- Menu browsing
- Cart management
- Order creation and tracking
- Admin menu management
- Admin/customer order cancellation logic
- SQLite persistence

## Tech Stack
- Node.js
- Express
- SQLite (`better-sqlite3`)
- Node built-in test runner (`node --test`)

## Architecture
The project follows a modular, service-based structure:

```text
src/
  app.js
  server.js
  config/
  constants/
  controllers/
  middlewares/
  repositories/
  routes/
  services/
  utils/
docs/
  api-reference.md
  assumptions.md
  data-model.md
  flow-notes.md
  diagrams/
test/
  api.integration.test.js
```

## Getting Started
1. Install dependencies.
```bash
npm install
```
2. Create environment file.
```powershell
Copy-Item .env.example .env -Force
```
3. Start development server.
```bash
npm run dev
```
4. Base URL:
`http://localhost:4000/api/v1`

## Environment Variables
| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `4000` | API server port |
| `ADMIN_TOKEN` | `admin-secret` | Header token used for admin-only simulation routes |
| `OTP_TTL_MINUTES` | `10` | OTP expiry window in minutes |
| `DB_PATH` | `./data/chuks_kitchen.db` | SQLite database file location |

## Available Scripts
- `npm run dev` - start API with `nodemon`
- `npm run start` - start API with Node
- `npm test` - run integration tests

## API Overview
| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/v1` | Public | API welcome + endpoint map |
| `GET` | `/api/v1/health` | Public | Health check |
| `POST` | `/api/v1/auth/signup` | Public | Register with email or phone |
| `POST` | `/api/v1/auth/verify` | Public | Verify OTP |
| `GET` | `/api/v1/foods` | Public | List menu items |
| `POST` | `/api/v1/foods` | Admin | Add menu item |
| `PATCH` | `/api/v1/foods/:id` | Admin | Update menu item |
| `POST` | `/api/v1/cart/items` | Customer | Add item to cart |
| `GET` | `/api/v1/cart/:userId` | Customer | View cart |
| `DELETE` | `/api/v1/cart/:userId/clear` | Customer | Clear cart |
| `POST` | `/api/v1/orders` | Customer | Create order from cart |
| `GET` | `/api/v1/orders/:id` | Customer/Admin | Get order details |
| `PATCH` | `/api/v1/orders/:id/status` | Customer/Admin | Update order status with transition checks |

Admin routes require header:
`x-admin-token: <ADMIN_TOKEN>`

## Core Business Rules Implemented
- Signup requires at least one of email or phone.
- Duplicate email or phone is rejected.
- Optional referral code must exist if provided.
- OTP verification enforces expiry and invalid-code handling.
- Only verified users can add to cart or place orders.
- Food availability is revalidated during order creation.
- Order transitions are guarded by a strict lifecycle.
- Customer cancellation is limited to allowed early states.
- Admin cancellation is limited to configured states.

## Order Status Lifecycle
- `Pending -> Confirmed | Cancelled`
- `Confirmed -> Preparing | Cancelled`
- `Preparing -> Out for Delivery | Cancelled`
- `Out for Delivery -> Completed`
- `Completed` and `Cancelled` are terminal states

## Persistence Notes
- Data is persisted in SQLite and survives restarts.
- The repository stores app state in SQLite through `src/repositories/db.js`.
- Database artifacts are written under `data/` and ignored in Git.

## Testing
Run tests:
```bash
npm test
```

Current integration coverage:
- Signup and OTP verification success
- Invalid OTP rejection
- Cart add blocked for unverified user
- Cart add blocked for unavailable food
- Valid status transition accepted
- Invalid status jump rejected

## Documentation Pack
- API reference: `docs/api-reference.md`
- Flow explanation: `docs/flow-notes.md`
- Assumptions and gaps: `docs/assumptions.md`
- Data model narrative: `docs/data-model.md`
- Diagram pack: `docs/diagrams/README.md`

## Diagram Files
- `docs/diagrams/user-registration-flow.md`
- `docs/diagrams/order-processing-flow.md`
- `docs/diagrams/order-status-lifecycle.md`
- `docs/diagrams/system-sequence.md`
- `docs/diagrams/erd.md`

## Conclusion
This project demonstrates a robust backend API implementation for a food ordering system, adhering to the specified requirements and showcasing best practices in API design, error handling, and documentation. The modular architecture allows for easy maintenance and future feature expansion.


