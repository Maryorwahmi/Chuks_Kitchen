# Backend Flow Notes

## 1) User Registration and Verification
1. User submits signup payload with email or phone.
2. System validates duplicate contact and optional referral code.
3. System creates unverified user and generates OTP with expiry.
4. User submits OTP for verification.
5. System validates OTP and marks account as verified.

Edge cases handled:
- Duplicate email/phone
- Invalid referral code
- Invalid or expired OTP
- Incomplete signup (unverified users remain in system)

## 2) Browsing and Menu Management
1. Customer fetches list of food items (`GET /foods`).
2. Admin creates or updates food items via admin-token routes.
3. Unavailable items are blocked during cart/order operations.

## 3) Cart and Order Placement
1. Verified user adds items to cart.
2. Cart response includes computed subtotals and total.
3. User creates order from cart.
4. System validates item availability at order-time.
5. System stores order and clears cart.

## 4) Order Lifecycle
Allowed transitions:
- Pending -> Confirmed, Cancelled
- Confirmed -> Preparing, Cancelled
- Preparing -> Out for Delivery, Cancelled
- Out for Delivery -> Completed

Blocked transitions return validation errors to avoid invalid state jumps.

## Diagram References
- `docs/diagrams/user-registration-flow.md`
- `docs/diagrams/order-processing-flow.md`
- `docs/diagrams/order-status-lifecycle.md`
- `docs/diagrams/system-sequence.md`
