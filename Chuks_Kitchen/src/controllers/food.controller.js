const { listFoods, addFood, updateFood } = require("../services/food.service");

function getFoodsHandler(req, res, next) {
  try {
    const data = listFoods();
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
}

function addFoodHandler(req, res, next) {
  try {
    const data = addFood(req.body);
    return res.status(201).json({
      success: true,
      message: "Food item created",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

function updateFoodHandler(req, res, next) {
  try {
    const data = updateFood(req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: "Food item updated",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getFoodsHandler,
  addFoodHandler,
  updateFoodHandler,
};
