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
  // --- SOFT errors: input format issues (user can fix, NOT fraud) ---

  // 1. Phone format
  if (!INDIAN_MOBILE_REGEX.test(phone)) {
    return { isValid: false, severity: "soft", reason: "Please enter a valid 10-digit mobile number starting with 6-9." };
  }

  // 2. Name too short
  if (!name || name.trim().length < 2) {
    return { isValid: false, severity: "soft", reason: "Please enter your full name." };
  }

  // 3. Room format: must be letter-dash-3digits (e.g. A-201, B-105)
  const ROOM_REGEX = /^[A-Za-z]-\d{3}$/;
  if (!room || !ROOM_REGEX.test(room.trim())) {
    return { isValid: false, severity: "soft", reason: "Room must be in format like A-201 (letter-dash-3 digits)." };
  }

  // --- HARD errors: clearly fake/junk data (counts toward fraud) ---

  // 4. Repeated digit phone (e.g. 9999999999)
  if (isRepeatedDigits(phone)) {
    return { isValid: false, severity: "hard", reason: "Phone number has all repeated digits" };
  }

  // 5. Name contains junk
  if (isJunkText(name)) {
    return { isValid: false, severity: "hard", reason: "Name contains junk/test data" };
  }

  // 6. Room contains junk
  if (isJunkText(room)) {
    return { isValid: false, severity: "hard", reason: "Room contains junk/test data" };
  }

  // 7. Check cancelled orders for this fingerprint
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
