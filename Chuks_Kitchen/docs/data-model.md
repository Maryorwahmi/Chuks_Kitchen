# Data Model (Draft)

## User
- `id` (UUID)
- `email` (nullable)
- `phone` (nullable)
- `referralCodeUsed` (nullable)
- `ownReferralCode`
- `isVerified`
- `verification` (otpCode, otpExpiresAt, attempts) nullable
- `createdAt`, `updatedAt`

## FoodItem
- `id` (UUID)
- `name`
- `category`
- `price`
- `available`
- `createdAt`, `updatedAt`

## Cart
- `id` (UUID)
- `userId` (FK User)
- `items[]` (foodId, quantity)
- `createdAt`, `updatedAt`

## Order
- `id` (UUID)
- `userId` (FK User)
- `items[]` (foodId, foodName, unitPrice, quantity, subtotal)
- `totalAmount`
- `paymentStatus`
- `status`
- `statusHistory[]` (status, actor, at, reason?)
- `cancellation` (actor, reason, at) nullable
- `createdAt`, `updatedAt`

## Relationships
- One `User` -> one active `Cart`
- One `User` -> many `Orders`
- One `Order` -> many order items snapshots
- `FoodItem` is referenced in cart and order item snapshots

## Diagram Reference
- `docs/diagrams/erd.md`
