function isValidEmail(value) {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value) {
  return typeof value === "string" && /^\+?[0-9]{7,15}$/.test(value);
}

function isPositiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}

module.exports = {
  isValidEmail,
  isValidPhone,
  isPositiveInteger,
};
