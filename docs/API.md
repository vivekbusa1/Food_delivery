# API Overview

Base URL: `/api/v1`  
Interactive docs: `/api-docs` (Swagger)

## Auth

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Signup |
| POST | `/auth/login` | Login |
| POST | `/auth/refresh` | Refresh tokens |
| POST | `/auth/logout` | Logout |
| POST | `/auth/otp/send` | Send OTP |
| POST | `/auth/otp/verify` | Verify OTP |
| POST | `/auth/forgot-password` | Forgot password |
| POST | `/auth/reset-password` | Reset password |
| POST | `/auth/change-password` | Change password (auth) |

## Customers / Users

| Method | Path | Auth |
|--------|------|------|
| GET | `/users/me` | Yes |
| PATCH | `/users/me` | Yes |
| DELETE | `/users/me` | Yes |
| GET | `/users` | Admin |

## Restaurants & Foods

| Method | Path | Notes |
|--------|------|-------|
| GET | `/restaurants` | Search, nearby, sort, filter |
| GET | `/restaurants/:id` | Detail |
| POST | `/restaurants` | Create / register |
| PATCH | `/restaurants/:id` | Update |
| PATCH | `/restaurants/:id/approval` | Admin approve/reject |
| GET/POST | `/foods` | List / create |
| GET/PATCH/DELETE | `/foods/:id` | CRUD |
| GET | `/categories` | Food categories |

## Cart & Orders

| Method | Path |
|--------|------|
| GET/POST/PATCH/DELETE | `/cart` |
| POST | `/orders` |
| GET | `/orders` |
| GET | `/orders/:id` |
| PATCH | `/orders/:id/status` |
| POST | `/orders/:id/reorder` |

## Commerce

| Method | Path |
|--------|------|
| CRUD | `/addresses` |
| CRUD | `/wishlist`, `/favorites` |
| POST | `/coupons/apply` |
| CRUD | `/coupons` (admin) |
| POST | `/reviews` |
| POST | `/payments/razorpay/create` |
| POST | `/payments/razorpay/verify` |
| POST | `/payments/stripe/intent` |
| POST | `/payments/:id/refund` |

## Admin & Delivery

| Method | Path |
|--------|------|
| GET | `/admin/dashboard` |
| CRUD | `/banners`, `/offers`, `/notifications` |
| GET/PATCH | `/settings` |
| Delivery partner routes | `/delivery/*` |

All responses use `{ success, message, data }`.
