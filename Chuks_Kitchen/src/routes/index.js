const { Router } = require("express");
const healthRoutes = require("./health.routes");
const authRoutes = require("./auth.routes");
const foodRoutes = require("./food.routes");
const cartRoutes = require("./cart.routes");
const orderRoutes = require("./order.routes");

const router = Router();

router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Chuks Kitchen API v1",
    endpoints: {
      health: "/api/v1/health",
      auth: {
        signup: "/api/v1/auth/signup",
        verify: "/api/v1/auth/verify",
      },
      foods: "/api/v1/foods",
      cart: {
        addItem: "/api/v1/cart/items",
        viewCart: "/api/v1/cart/:userId",
        clearCart: "/api/v1/cart/:userId/clear",
      },
      orders: {
        create: "/api/v1/orders",
        getById: "/api/v1/orders/:id",
        updateStatus: "/api/v1/orders/:id/status",
      },
    },
  });
});

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/foods", foodRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);

module.exports = router;
