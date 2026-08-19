# Installation Guide

## Prerequisites

- Node.js 18+
- npm 9+ or yarn
- MongoDB 6+ (local or Atlas)
- Docker & Docker Compose (optional)
- Expo Go app (for mobile device testing)
- Cloudinary account (image uploads)
- Razorpay / Stripe keys (optional for online payments)

## 1. Clone & environment

```bash
cd DeliveryApp__User
cp .env.example backend/.env
```

Edit `backend/.env`:

```env
MONGODB_URL=mongodb://127.0.0.1:27017/food_delivery
# or Atlas: mongodb+srv://user:pass@cluster/food_delivery
JWT_SECRET=your_long_random_access_secret
JWT_REFRESH_SECRET=your_long_random_refresh_secret
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
STRIPE_SECRET_KEY=
OTP_EXPIRE_MINUTES=10
```

**Never commit real secrets.** Use environment variables only.

## 2. Backend

```bash
cd backend
npm install
npm run seed
npm run dev
```

- API: http://localhost:5000/api/v1  
- Health: http://localhost:5000/health  
- Swagger: http://localhost:5000/api-docs  

Seed admin: `admin@fooddelivery.com` / `Admin@123`

## 3. Admin Panel

```bash
cd admin-panel
cp .env.example .env
# VITE_API_URL=http://localhost:5000/api/v1
npm install
npm run dev
```

Open http://localhost:5173

## 4. Restaurant Panel

```bash
cd restaurant-panel
cp .env.example .env
# VITE_API_URL=http://localhost:5000/api/v1
npm install
npm run dev
```

Open http://localhost:5174 (or the port Vite prints)

## 5. Mobile App

```bash
cd mobile-app
cp .env.example .env
# EXPO_PUBLIC_API_URL=http://YOUR_LAN_IP:5000/api/v1
npm install
npx expo start
```

Notes:

- iOS simulator: `http://localhost:5000/api/v1`
- Android emulator: `http://10.0.2.2:5000/api/v1`
- Physical device: use your machine’s LAN IP (same Wi‑Fi)

## 6. Docker (full stack)

```bash
cp backend/.env.example backend/.env
# Set Cloudinary etc. MONGODB_URL is overridden in compose for the mongo service.
docker-compose up -d --build
```

| Service | URL |
|---------|-----|
| API | http://localhost:5000 |
| Admin | http://localhost:5173 |
| Restaurant | http://localhost:5174 |
| MongoDB | localhost:27017 |

Seed after containers are up:

```bash
docker exec -it food_delivery_api npm run seed
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Mongo connection failed | Check `MONGODB_URL`, ensure Mongo is running |
| CORS errors | Set `CLIENT_URL` and allow mobile origin in backend CORS |
| Images not uploading | Verify Cloudinary env vars |
| Mobile can’t reach API | Use LAN IP, not `localhost`, on real devices |
| JWT errors after restart | Secrets changed — clear app storage / re-login |

## Production checklist

- [ ] Strong unique JWT secrets
- [ ] MongoDB Atlas with network restrictions
- [ ] HTTPS reverse proxy (Nginx / Caddy)
- [ ] Cloudinary production folder
- [ ] Rate limits tuned
- [ ] Socket.IO sticky sessions if multiple API nodes
- [ ] Backup & monitoring
