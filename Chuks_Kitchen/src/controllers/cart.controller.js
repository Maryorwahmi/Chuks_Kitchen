const { addItemToCart, getCartByUserId, clearCart } = require("../services/cart.service");

function addCartItemHandler(req, res, next) {
  try {
    const data = addItemToCart(req.body);
    return res.status(200).json({
      success: true,
      message: "Item added to cart",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

function getCartHandler(req, res, next) {
  try {
    const data = getCartByUserId(req.params.userId);
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
}

function clearCartHandler(req, res, next) {
  try {
    const data = clearCart(req.params.userId);
    return res.status(200).json({
      success: true,
      message: "Cart cleared",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  addCartItemHandler,
  getCartHandler,
  clearCartHandler,
};
