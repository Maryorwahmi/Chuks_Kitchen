const test = require("node:test");
const assert = require("node:assert/strict");
const { app } = require("../src/app");
const { env } = require("../src/config/env");
const { resetDb } = require("../src/repositories/db");

let server;
let baseUrl;

async function request(path, options = {}) {
  const { headers = {}, ...restOptions } = options;

  const response = await fetch(`${baseUrl}${path}`, {
    ...restOptions,
    headers: {
      "content-type": "application/json",
      ...headers,
    },
  });

  const data = await response.json();
  return { status: response.status, data };
}

async function createVerifiedUser() {
  const signup = await request("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email: "verified@example.com" }),
  });

  assert.equal(signup.status, 201);
  const verify = await request("/auth/verify", {
    method: "POST",
    body: JSON.stringify({
      userId: signup.data.data.userId,
      otp: signup.data.data.otp,
    }),
  });
  assert.equal(verify.status, 200);

  return signup.data.data.userId;
}

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });

  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}/api/v1`;
});

test.after(async () => {
  await new Promise((resolve) => {
    server.close(resolve);
  });
});

test.beforeEach(() => {
  resetDb();
});

test("signup and verify succeeds with valid OTP", async () => {
  const signup = await request("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email: "newuser@example.com" }),
  });

  assert.equal(signup.status, 201);
  assert.equal(signup.data.success, true);
  assert.equal(signup.data.data.isVerified, false);
  assert.ok(signup.data.data.otp);

  const verify = await request("/auth/verify", {
    method: "POST",
    body: JSON.stringify({
      userId: signup.data.data.userId,
      otp: signup.data.data.otp,
    }),
  });

  assert.equal(verify.status, 200);
  assert.equal(verify.data.success, true);
  assert.equal(verify.data.data.isVerified, true);
});

test("verify fails with invalid OTP", async () => {
  const signup = await request("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ phone: "+2348012345678" }),
  });

  assert.equal(signup.status, 201);

  const verify = await request("/auth/verify", {
    method: "POST",
    body: JSON.stringify({
      userId: signup.data.data.userId,
      otp: "000000",
    }),
  });

  assert.equal(verify.status, 400);
  assert.equal(verify.data.success, false);
  assert.equal(verify.data.message, "Invalid or expired OTP");
});

test("cart add fails for unverified user", async () => {
  const signup = await request("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email: "pending@example.com" }),
  });
  assert.equal(signup.status, 201);

  const foods = await request("/foods", { method: "GET" });
  assert.equal(foods.status, 200);

  const addToCart = await request("/cart/items", {
    method: "POST",
    body: JSON.stringify({
      userId: signup.data.data.userId,
      foodId: foods.data.data[0].id,
      quantity: 1,
    }),
  });

  assert.equal(addToCart.status, 403);
  assert.equal(addToCart.data.success, false);
  assert.equal(addToCart.data.message, "Complete account verification before adding to cart");
});

test("cart add fails when food is marked unavailable", async () => {
  const userId = await createVerifiedUser();
  const foods = await request("/foods", { method: "GET" });
  assert.equal(foods.status, 200);
  const targetFoodId = foods.data.data[0].id;

  const disableFood = await request(`/foods/${targetFoodId}`, {
    method: "PATCH",
    headers: { "x-admin-token": env.adminToken },
    body: JSON.stringify({ available: false }),
  });
  assert.equal(
    disableFood.status,
    200,
    `Expected admin update to succeed but got ${disableFood.status}: ${JSON.stringify(disableFood.data)}`
  );

  const addToCart = await request("/cart/items", {
    method: "POST",
    body: JSON.stringify({
      userId,
      foodId: targetFoodId,
      quantity: 1,
    }),
  });

  assert.equal(addToCart.status, 400);
  assert.equal(addToCart.data.success, false);
  assert.equal(addToCart.data.message, "Food item is currently unavailable");
});

test("order status allows valid transition and blocks invalid jump", async () => {
  const userId = await createVerifiedUser();
  const foods = await request("/foods", { method: "GET" });
  const foodId = foods.data.data[0].id;

  const addToCart = await request("/cart/items", {
    method: "POST",
    body: JSON.stringify({ userId, foodId, quantity: 2 }),
  });
  assert.equal(addToCart.status, 200);

  const createOrder = await request("/orders", {
    method: "POST",
    body: JSON.stringify({ userId }),
  });
  assert.equal(createOrder.status, 201);
  assert.equal(createOrder.data.data.status, "Pending");
  const orderId = createOrder.data.data.id;

  const moveToConfirmed = await request(`/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: "Confirmed", actor: "admin" }),
  });

  assert.equal(moveToConfirmed.status, 200);
  assert.equal(moveToConfirmed.data.data.status, "Confirmed");

  const invalidJumpToCompleted = await request(`/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: "Completed", actor: "admin" }),
  });

  assert.equal(invalidJumpToCompleted.status, 400);
  assert.equal(invalidJumpToCompleted.data.success, false);
  assert.match(invalidJumpToCompleted.data.message, /Invalid status transition/);
});
