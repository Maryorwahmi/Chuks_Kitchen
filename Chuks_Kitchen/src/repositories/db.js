const { randomUUID } = require("crypto");
const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");
const { env } = require("../config/env");

function createId() {
  return randomUUID();
}

function nowIso() {
  return new Date().toISOString();
}

function buildSeedFoods() {
  return [
    {
      id: createId(),
      name: "Jollof Rice & Chicken",
      category: "Rice",
      price: 4500,
      available: true,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      id: createId(),
      name: "Fried Rice & Turkey",
      category: "Rice",
      price: 5000,
      available: true,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      id: createId(),
      name: "Egusi Soup & Pounded Yam",
      category: "Swallow",
      price: 6000,
      available: true,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      id: createId(),
      name: "Spaghetti Bolognese",
      category: "Pasta",
      price: 4200,
      available: true,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  ];
}

function buildInitialState() {
  return {
    users: [],
    foods: buildSeedFoods(),
    carts: [],
    orders: [],
  };
}

const dataDir = path.dirname(env.dbPath);
fs.mkdirSync(dataDir, { recursive: true });

const sqlite = new Database(env.dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS app_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    data TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`);

function saveState(state) {
  sqlite
    .prepare(
      `
      INSERT INTO app_state (id, data, updated_at)
      VALUES (1, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        data = excluded.data,
        updated_at = excluded.updated_at
    `
    )
    .run(JSON.stringify(state), nowIso());
}

function loadState() {
  const row = sqlite.prepare("SELECT data FROM app_state WHERE id = 1").get();
  if (!row) {
    const initialState = buildInitialState();
    saveState(initialState);
    return initialState;
  }

  try {
    const parsed = JSON.parse(row.data);
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      foods: Array.isArray(parsed.foods) && parsed.foods.length > 0 ? parsed.foods : buildSeedFoods(),
      carts: Array.isArray(parsed.carts) ? parsed.carts : [],
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
    };
  } catch (error) {
    const initialState = buildInitialState();
    saveState(initialState);
    return initialState;
  }
}

const db = loadState();

function persistDb() {
  saveState(db);
}

function resetDb() {
  const initialState = buildInitialState();
  db.users = initialState.users;
  db.foods = initialState.foods;
  db.carts = initialState.carts;
  db.orders = initialState.orders;
  persistDb();
}

module.exports = { db, createId, nowIso, resetDb, persistDb };
