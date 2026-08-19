# Food Delivery Platform

Production-ready food delivery system similar to Zomato / Swiggy.

## Monorepo

| Package | Stack | Port |
|---------|--------|------|
| `backend/` | Node.js, Express, MongoDB, Socket.IO | `PORT` from `.env` (default **5000**; often **5001** on macOS if 5000 is busy) |
| `admin-panel/` | React, Vite, MUI, React Query | 5173 |
| `restaurant-panel/` | React, Vite, MUI, React Query | 5174 |
| `mobile-app/` | Expo, TypeScript, React Native Paper | Metro |
| `docs/` | Installation, API, architecture | — |

## Features

- JWT auth (customer, restaurant, admin, delivery partner) with refresh tokens & OTP
- Full order lifecycle with Socket.IO live updates
- Cart, coupons, payments (COD, Razorpay, Stripe-ready)
- Cloudinary uploads, Winston logging, rate limiting, Helmet
- Admin analytics (Recharts), restaurant ops panel, customer mobile app
- Swagger at `/api-docs`, seed script, Docker Compose

## Quick start

See [docs/INSTALLATION.md](docs/INSTALLATION.md).

```bash
# MongoDB (Docker)
docker compose up -d mongodb

# 1. Backend
cp backend/.env.example backend/.env   # set MONGODB_URL (and PORT if 5000 is taken)
cd backend && npm install && npm run seed && npm run dev

# 2. Admin
cd admin-panel && npm install && npm run dev

# 3. Restaurant
cd restaurant-panel && npm install && npm run dev

# 4. Mobile
cd mobile-app && npm install && npx expo start
```

Or with Docker (full stack):

```bash
cp backend/.env.example backend/.env
docker compose up -d --build
```

## Default seed credentials

From `backend/.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`), defaults:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@fooddelivery.com | Admin@123 |
| Customer | customer@fooddelivery.com | Customer@123 |
| Restaurant owner | owner1@fooddelivery.com … owner4@fooddelivery.com | Owner@123 |

## API

- Port: value of `PORT` in `backend/.env` (defaults to `5000`; use `5001` if macOS Control Center / AirPlay occupies 5000)
- Health: `http://localhost:<PORT>/health` and `http://localhost:<PORT>/api/v1/health`
- Base: `http://localhost:<PORT>/api/v1`
- Docs: `http://localhost:<PORT>/api-docs`
- Env: `MONGODB_URL` (never hardcode credentials)

## License

MIT
