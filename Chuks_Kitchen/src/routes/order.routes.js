const { Router } = require("express");
const { createOrderHandler, getOrderHandler, updateOrderStatusHandler } = require("../controllers/order.controller");

const router = Router();

router.post("/", createOrderHandler);
router.get("/:id", getOrderHandler);
router.patch("/:id/status", updateOrderStatusHandler);

module.exports = router;
