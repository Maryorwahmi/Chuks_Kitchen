const { db, createId, nowIso, persistDb } = require("../repositories/db");
const { HttpError } = require("../utils/http-error");

function listFoods() {
  return db.foods;
}

function getFoodById(foodId) {
  return db.foods.find((food) => food.id === foodId) || null;
}

function addFood(payload) {
  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const category = typeof payload.category === "string" ? payload.category.trim() : "";
  const price = Number(payload.price);
  const available = payload.available === undefined ? true : Boolean(payload.available);

  if (!name || !category || Number.isNaN(price)) {
    throw new HttpError(400, "name, category and price are required");
  }

  if (price <= 0) {
    throw new HttpError(400, "price must be greater than zero");
  }

  const food = {
    id: createId(),
    name,
    category,
    price,
    available,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  db.foods.push(food);
  persistDb();
  return food;
}

function updateFood(foodId, payload) {
  const food = getFoodById(foodId);
  if (!food) {
    throw new HttpError(404, "Food item not found");
  }

  if (payload.name !== undefined) {
    const nextName = String(payload.name).trim();
    if (!nextName) {
      throw new HttpError(400, "name cannot be empty");
    }
    food.name = nextName;
  }

  if (payload.category !== undefined) {
    const nextCategory = String(payload.category).trim();
    if (!nextCategory) {
      throw new HttpError(400, "category cannot be empty");
    }
    food.category = nextCategory;
  }

  if (payload.price !== undefined) {
    const nextPrice = Number(payload.price);
    if (Number.isNaN(nextPrice) || nextPrice <= 0) {
      throw new HttpError(400, "price must be greater than zero");
    }
    food.price = nextPrice;
  }

  if (payload.available !== undefined) {
    food.available = Boolean(payload.available);
  }

  food.updatedAt = nowIso();
  persistDb();
  return food;
}

module.exports = {
  listFoods,
  getFoodById,
  addFood,
  updateFood,
};
