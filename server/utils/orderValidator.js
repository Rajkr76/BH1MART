const Order = require("../models/Order");

// Indian mobile: starts with 6-9, exactly 10 digits
const INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/;

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
 * Check if all digits in a phone number are the same (e.g. 9999999999)
 */
function isRepeatedDigits(phone) {
  return /^(\d)\1{9}$/.test(phone);
}

/**
 * Check if a string matches junk patterns
 */
function isJunkText(text) {
  const trimmed = (text || "").trim().toLowerCase();
  return JUNK_PATTERNS.some((pattern) => pattern.test(trimmed));
}

/**
 * Validate an order for fake/invalid data.
 * @param {Object} params
 * @param {string} params.phone
 * @param {string} params.name
 * @param {string} params.room
 * @param {string} params.fingerprint
 * @returns {Promise<{ isValid: boolean, reason: string }>}
 */
async function validateOrder({ phone, name, room, fingerprint }) {
  // 1. Phone validation
  if (!INDIAN_MOBILE_REGEX.test(phone)) {
    return { isValid: false, reason: "Invalid phone number format" };
  }

  // 2. Repeated digit phone
  if (isRepeatedDigits(phone)) {
    return { isValid: false, reason: "Phone number has all repeated digits" };
  }

  // 3. Name too short
  if (!name || name.trim().length < 2) {
    return { isValid: false, reason: "Name is too short" };
  }

  // 4. Name contains junk
  if (isJunkText(name)) {
    return { isValid: false, reason: "Name contains junk/test data" };
  }

  // 5. Room field too short
  if (!room || room.trim().length < 1) {
    return { isValid: false, reason: "Room number is required" };
  }

  // 6. Room contains junk
  if (isJunkText(room)) {
    return { isValid: false, reason: "Room contains junk/test data" };
  }

  // 7. Check cancelled orders for this fingerprint
  if (fingerprint) {
    const cancelledCount = await Order.countDocuments({
      fingerprint,
      status: "cancelled",
    });
    if (cancelledCount > 2) {
      return { isValid: false, reason: "Too many cancelled orders from this device" };
    }
  }

  return { isValid: true, reason: "" };
}

module.exports = { validateOrder };
