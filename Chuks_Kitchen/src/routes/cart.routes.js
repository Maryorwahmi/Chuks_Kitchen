const { Router } = require("express");
const { addCartItemHandler, getCartHandler, clearCartHandler } = require("../controllers/cart.controller");

const router = Router();

router.post("/items", addCartItemHandler);
router.get("/:userId", getCartHandler);
router.delete("/:userId/clear", clearCartHandler);

module.exports = router;
