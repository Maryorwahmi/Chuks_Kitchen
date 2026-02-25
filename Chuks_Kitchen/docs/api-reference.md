# API Reference (v1)

Base URL: `/api/v1`

## Health
### `GET /health`
Simple health check endpoint.

## Auth
### `POST /auth/signup`
Registers a user by email or phone.

Request body:
```json
{
  "email": "user@example.com",
  "phone": "+2348012345678",
  "referralCode": "CHUKS-123456"
}
```

Notes:
- `email` or `phone` is required.
- OTP is simulated and returned in response for assignment/testing.

### `POST /auth/verify`
Verifies user with OTP.

Request body:
```json
{
  "userId": "uuid",
  "otp": "123456"
}
```

## Foods
### `GET /foods`
Returns all menu items.

### `POST /foods`
Adds a menu item. Admin simulation only.

Headers:
`x-admin-token: <ADMIN_TOKEN>`

Request body:
```json
{
  "name": "Amala & Ewedu",
  "category": "Swallow",
  "price": 5200,
  "available": true
}
```

### `PATCH /foods/:id`
Updates price/availability/item metadata. Admin simulation only.

## Cart
### `POST /cart/items`
Adds food to cart.

Request body:
```json
{
  "userId": "uuid",
  "foodId": "uuid",
  "quantity": 2
}
```

### `GET /cart/:userId`
Returns current cart and computed totals.

### `DELETE /cart/:userId/clear`
Clears the cart.

## Orders
### `POST /orders`
Creates an order from user cart.

Request body:
```json
{
  "userId": "uuid"
}
```

### `GET /orders/:id`
Returns order details and status.

### `PATCH /orders/:id/status`
Updates order status with lifecycle enforcement.

Request body:
```json
{
  "status": "Confirmed",
  "actor": "admin",
  "reason": "Kitchen accepted"
}
```
