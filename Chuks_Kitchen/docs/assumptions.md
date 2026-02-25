# Assumptions

1. OTP verification is simulated and OTP is returned in API response for testing.
2. OTP expires after `OTP_TTL_MINUTES` (default: 10 minutes).
3. No full authentication/authorization is required for this assignment.
4. Admin actions are simulated with `x-admin-token`.
5. Payment is logic-only and represented as `paymentStatus: "Pending"` on order creation.
6. Customer can cancel only in `Pending` or `Confirmed`.
7. Admin can cancel in `Pending`, `Confirmed`, or `Preparing`.
8. Cart is user-scoped and automatically cleared after successful order creation.
9. If an item becomes unavailable before checkout, order creation fails.
10. Data persists in SQLite (`DB_PATH`) using an assignment-friendly single-state storage approach.
