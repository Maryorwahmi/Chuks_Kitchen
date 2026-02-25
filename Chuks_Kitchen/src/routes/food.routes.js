const { Router } = require("express");
const { getFoodsHandler, addFoodHandler, updateFoodHandler } = require("../controllers/food.controller");
const { requireAdmin } = require("../middlewares/require-admin");

const router = Router();

router.get("/", getFoodsHandler);
router.post("/", requireAdmin, addFoodHandler);
router.patch("/:id", requireAdmin, updateFoodHandler);

module.exports = router;
