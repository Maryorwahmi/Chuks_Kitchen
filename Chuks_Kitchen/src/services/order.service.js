const { db, createId, nowIso, persistDb } = require("../repositories/db");
const { HttpError } = require("../utils/http-error");
const { ORDER_STATUS, STATUS_TRANSITIONS } = require("../constants/order-status");
const { getFoodById } = require("./food.service");
const { getUserById } = require("./auth.service");
const { clearCart } = require("./cart.service");

function mapCartItemsToOrderItems(cartItems) {
  let totalAmount = 0;

  const orderItems = cartItems.map((item) => {
    const food = getFoodById(item.foodId);
    if (!food) {
      throw new HttpError(400, "One or more cart items no longer exist");
    }
    if (!food.available) {
      throw new HttpError(400, `Food item unavailable: ${food.name}`);
    }

    const unitPrice = food.price;
    const subtotal = unitPrice * item.quantity;
    totalAmount += subtotal;

    return {
      foodId: food.id,
      foodName: food.name,
      quantity: item.quantity,
      unitPrice,
      subtotal,
    };
  });

  return { orderItems, totalAmount };
}

function createOrder(payload) {
  const userId = typeof payload.userId === "string" ? payload.userId.trim() : "";
  if (!userId) {
    throw new HttpError(400, "userId is required");
  }

  const user = getUserById(userId);
  if (!user) {
    throw new HttpError(404, "User not found");
  }
  if (!user.isVerified) {
    throw new HttpError(403, "Complete account verification before placing an order");
  }

  const cart = db.carts.find((entry) => entry.userId === userId);
  if (!cart || cart.items.length === 0) {
    throw new HttpError(400, "Cart is empty");
  }

  const { orderItems, totalAmount } = mapCartItemsToOrderItems(cart.items);

  const order = {
    id: createId(),
    userId,
    items: orderItems,
    totalAmount,
    paymentStatus: "Pending",
    status: ORDER_STATUS.PENDING,
    statusHistory: [
      {
        status: ORDER_STATUS.PENDING,
        actor: "system",
        at: nowIso(),
      },
    ],
    cancellation: null,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  db.orders.push(order);
  clearCart(userId);
  persistDb();

  return order;
}

function getOrderById(orderId) {
  const order = db.orders.find((entry) => entry.id === orderId);
  if (!order) {
    throw new HttpError(404, "Order not found");
  }
  return order;
}

function updateOrderStatus(orderId, payload) {
  const order = getOrderById(orderId);
  const nextStatus = typeof payload.status === "string" ? payload.status.trim() : "";
  const actor = typeof payload.actor === "string" ? payload.actor.trim().toLowerCase() : "admin";
  const reason = typeof payload.reason === "string" ? payload.reason.trim() : null;

  if (!nextStatus) {
    throw new HttpError(400, "status is required");
  }

  const statusValues = Object.values(ORDER_STATUS);
  if (!statusValues.includes(nextStatus)) {
    throw new HttpError(400, "Invalid order status");
  }

  if (order.status === nextStatus) {
    return order;
  }

  if (actor === "customer" && nextStatus !== ORDER_STATUS.CANCELLED) {
    throw new HttpError(403, "Customers can only cancel orders");
  }

  if (nextStatus === ORDER_STATUS.CANCELLED) {
    const customerCancellableStates = [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED];
    const adminCancellableStates = [
      ORDER_STATUS.PENDING,
      ORDER_STATUS.CONFIRMED,
      ORDER_STATUS.PREPARING,
    ];

    if (actor === "customer" && !customerCancellableStates.includes(order.status)) {
      throw new HttpError(400, "Customer cannot cancel order at current stage");
    }

    if (actor === "admin" && !adminCancellableStates.includes(order.status)) {
      throw new HttpError(400, "Admin cannot cancel order at current stage");
    }
  }

  const allowedTransitions = STATUS_TRANSITIONS[order.status] || [];
  if (!allowedTransitions.includes(nextStatus)) {
    throw new HttpError(400, `Invalid status transition from ${order.status} to ${nextStatus}`);
  }

  order.status = nextStatus;
  order.updatedAt = nowIso();
  order.statusHistory.push({
    status: nextStatus,
    actor,
    at: nowIso(),
    reason,
  });

  if (nextStatus === ORDER_STATUS.CANCELLED) {
    order.cancellation = {
      actor,
      reason: reason || "No reason provided",
      at: nowIso(),
    };
  }

  persistDb();
  return order;
}

module.exports = {
  createOrder,
  getOrderById,
  updateOrderStatus,
};
