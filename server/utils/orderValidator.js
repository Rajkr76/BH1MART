const Order = require("../models/Order");
const { validatePhone, stripPhone } = require("./validatePhone");
const { validateName } = require("./validateName");

// Junk patterns for room/address fields
const JUNK_PATTERNS = [
  /^abc/i,
  /^test/i,
  /^xxx/i,
  /^asdf/i,
  /^qwerty/i,
  /^123$/,
  /^aaa+$/i,
  /^bbb+$/i,
  /^fake/i,
  /^none/i,
  /^na$/i,
  /^n\/a$/i,
];

/**
 * Check if a string matches junk patterns
 */
function isJunkText(text) {
  const trimmed = (text || "").trim().toLowerCase();
  return JUNK_PATTERNS.some((pattern) => pattern.test(trimmed));
}

/**
 * Validate an order for fake/invalid data.
 * Uses shared phone and name validators from config.
 * @param {Object} params
 * @param {string} params.phone
 * @param {string} params.name
 * @param {string} params.room
 * @param {string} params.fingerprint
 * @returns {Promise<{ isValid: boolean, reason: string, severity: string }>}
 */
async function validateOrder({ phone, name, room, fingerprint }) {
  // --- Phone validation (uses shared config + fake detection) ---
  const phoneResult = validatePhone(phone);
  if (!phoneResult.valid) {
    return { isValid: false, severity: phoneResult.severity, reason: phoneResult.reason };
  }

  // --- Name validation (human name detection) ---
  const nameResult = validateName(name);
  if (!nameResult.valid) {
    return { isValid: false, severity: nameResult.severity, reason: nameResult.reason };
  }

  // --- Room format: must be letter-dash-3digits (e.g. A-201, B-105) ---
  const ROOM_REGEX = /^[A-Za-z]-\d{3}$/;
  if (!room || !ROOM_REGEX.test(room.trim())) {
    return { isValid: false, severity: "soft", reason: "Room must be in format like A-201 (letter-dash-3 digits)." };
  }

  // --- Room contains junk ---
  if (isJunkText(room)) {
    return { isValid: false, severity: "hard", reason: "Room contains junk/test data" };
  }

  // --- Check cancelled orders for this fingerprint ---
  if (fingerprint) {
    const cancelledCount = await Order.countDocuments({
      fingerprint,
      status: "cancelled",
    });
    if (cancelledCount > 2) {
      return { isValid: false, severity: "hard", reason: "Too many cancelled orders from this device" };
    }
  }

  return { isValid: true, severity: "none", reason: "" };
}

module.exports = { validateOrder };
