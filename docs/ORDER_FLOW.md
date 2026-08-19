# Order Flow

## Happy path

```
pending → confirmed → preparing → ready_for_pickup → out_for_delivery → delivered
```

## Terminal / alternate

- `cancelled` — customer or admin cancel before delivery
- `rejected` — restaurant rejects the order

## Status constants

Defined in `backend/src/constants/orderStatus.js`:

| Constant | Value |
|----------|-------|
| PENDING | pending |
| CONFIRMED | confirmed |
| PREPARING | preparing |
| READY_FOR_PICKUP | ready_for_pickup |
| OUT_FOR_DELIVERY | out_for_delivery |
| DELIVERED | delivered |
| CANCELLED | cancelled |
| REJECTED | rejected |

## Actors

1. **Customer** — place order (cart → checkout → payment)
2. **Restaurant** — confirm / reject → preparing → ready
3. **Admin / Restaurant** — assign delivery partner
4. **Delivery partner** — pickup → out for delivery → delivered

## Realtime

Socket.IO rooms: `user:{id}`, `restaurant:{id}`, `delivery:{id}`, `order:{id}` emit status changes and notifications.

## Payment methods

`cod` | `razorpay` | `stripe` | `wallet`

Payment status: `pending` | `paid` | `failed` | `refunded`
