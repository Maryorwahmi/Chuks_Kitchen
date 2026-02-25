const { createOrder, getOrderById, updateOrderStatus } = require("../services/order.service");

function createOrderHandler(req, res, next) {
  try {
    const data = createOrder(req.body);
    return res.status(201).json({
      success: true,
      message: "Order created",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

function getOrderHandler(req, res, next) {
  try {
    const data = getOrderById(req.params.id);
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
}

function updateOrderStatusHandler(req, res, next) {
  try {
    const data = updateOrderStatus(req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: "Order status updated",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createOrderHandler,
  getOrderHandler,
  updateOrderStatusHandler,
};
