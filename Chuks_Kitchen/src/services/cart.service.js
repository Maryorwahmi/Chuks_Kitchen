const { db, createId, nowIso, persistDb } = require("../repositories/db");
const { HttpError } = require("../utils/http-error");
const { isPositiveInteger } = require("../utils/validators");
const { getFoodById } = require("./food.service");
const { getUserById } = require("./auth.service");

function getOrCreateCart(userId) {
  let cart = db.carts.find((entry) => entry.userId === userId);
  if (!cart) {
    cart = {
      id: createId(),
      userId,
      items: [],
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    db.carts.push(cart);
    persistDb();
  }
  return cart;
}

function buildCartResponse(cart) {
  let totalAmount = 0;

  const items = cart.items.map((item) => {
    const food = getFoodById(item.foodId);
    const price = food ? food.price : 0;
    const subtotal = price * item.quantity;
    totalAmount += subtotal;

    return {
      foodId: item.foodId,
      foodName: food ? food.name : "Unknown Item",
      unitPrice: price,
      quantity: item.quantity,
      subtotal,
      available: food ? food.available : false,
    };
  });

  return {
    cartId: cart.id,
    userId: cart.userId,
    items,
    totalAmount,
    updatedAt: cart.updatedAt,
  };
}

function addItemToCart(payload) {
  const userId = typeof payload.userId === "string" ? payload.userId.trim() : "";
  const foodId = typeof payload.foodId === "string" ? payload.foodId.trim() : "";
  const quantity = Number(payload.quantity);

  if (!userId || !foodId || Number.isNaN(quantity)) {
    throw new HttpError(400, "userId, foodId and quantity are required");
  }

  if (!isPositiveInteger(quantity)) {
    throw new HttpError(400, "quantity must be a positive integer");
  }

  const user = getUserById(userId);
  if (!user) {
    throw new HttpError(404, "User not found");
  }
  if (!user.isVerified) {
    throw new HttpError(403, "Complete account verification before adding to cart");
  }

  const food = getFoodById(foodId);
  if (!food) {
    throw new HttpError(404, "Food item not found");
  }
  if (!food.available) {
    throw new HttpError(400, "Food item is currently unavailable");
  }

  const cart = getOrCreateCart(userId);
  const existingItem = cart.items.find((item) => item.foodId === foodId);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({
      foodId,
      quantity,
    });
  }

  cart.updatedAt = nowIso();
  persistDb();
  return buildCartResponse(cart);
}

function getCartByUserId(userId) {
  const user = getUserById(userId);
  if (!user) {
    throw new HttpError(404, "User not found");
  }

  const cart = getOrCreateCart(userId);
  return buildCartResponse(cart);
}

function clearCart(userId) {
  const cart = getOrCreateCart(userId);
  cart.items = [];
  cart.updatedAt = nowIso();
  persistDb();
  return buildCartResponse(cart);
}

module.exports = {
  addItemToCart,
  getCartByUserId,
  clearCart,
};
