# Architecture

## Overview

```
┌─────────────┐  ┌──────────────────┐  ┌─────────────────┐
│ Mobile App  │  │  Admin Panel     │  │ Restaurant Panel│
│ (Expo RN)   │  │  (React + MUI)   │  │ (React + MUI)   │
└──────┬──────┘  └────────┬─────────┘  └────────┬────────┘
       │                  │                     │
       │         REST /api/v1 + Socket.IO       │
       └──────────────────┼─────────────────────┘
                          │
                 ┌────────▼────────┐
                 │  Express API    │
                 │  JWT + RBAC     │
                 └────────┬────────┘
                          │
                 ┌────────▼────────┐
                 │    MongoDB      │
                 └─────────────────┘
```

## Roles

| Role | Clients |
|------|---------|
| `customer` | Mobile app |
| `restaurant` | Restaurant panel (+ registration) |
| `admin` | Admin panel |
| `delivery` | Mobile delivery navigator |

## Order flow

Pending → Accepted → Preparing → Ready → Assigned → Picked Up → On The Way → Delivered  
(also Cancelled / Rejected)

Realtime status is emitted on Socket.IO rooms: `order:{orderId}`, `restaurant:{id}`, `user:{id}`, `delivery:{id}`.

## Backend layers

1. **Routes** — `/api/v1/*`, versioned REST  
2. **Validators** — express-validator  
3. **Controllers** — HTTP adapter  
4. **Services** — business logic  
5. **Models** — Mongoose schemas + indexes  
6. **Middleware** — auth, roles, rate limit, upload, errors  

## Response contract

Success:

```json
{ "success": true, "message": "...", "data": {} }
```

Error:

```json
{ "success": false, "message": "...", "data": null }
```

## Security

- Helmet, CORS, compression  
- Rate limiting on auth routes  
- Bcrypt passwords, JWT access + refresh  
- Input validation + mongo sanitize  
- Role middleware on protected routes  

## Payments

- COD — create order with `paymentMethod: cod`  
- Razorpay — create order → client pay → verify signature  
- Stripe — PaymentIntent create/confirm ready via env keys  
