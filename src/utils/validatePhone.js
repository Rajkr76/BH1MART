/**
 * Phone number validation utility (frontend).
 * Validates Indian mobile numbers and detects fake/prank numbers.
 */

import {
  KNOWN_FAKE_NUMBERS,
  FAKE_PATTERNS,
  MIN_UNIQUE_DIGITS,
  MIN_ENTROPY,
} from "@/config/fakeNumbers";

// Indian mobile: exactly 10 digits, starts with 6-9
const INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/;

/**
 * Calculate Shannon entropy of a string.
 */
function shannonEntropy(str) {
  const freq = {};
  for (const ch of str) {
    freq[ch] = (freq[ch] || 0) + 1;
  }
  let entropy = 0;
  const len = str.length;
  for (const ch in freq) {
    const p = freq[ch] / len;
    if (p > 0) entropy -= p * Math.log2(p);
  }
  return entropy;
}

/**
 * Strip non-digit characters from input.
 */
export function stripPhone(input) {
  if (!input) return "";
  let cleaned = String(input).replace(/\D/g, "");
  if (cleaned.startsWith("91") && cleaned.length === 12) {
    cleaned = cleaned.slice(2);
  }
  return cleaned;
}

/**
 * Validate an Indian mobile phone number.
 * @param {string} rawPhone - The raw phone input
 * @returns {{ valid: boolean, reason: string, phone: string }}
 */
export function validatePhone(rawPhone) {
  const phone = stripPhone(rawPhone);

  // Basic format check
  if (!INDIAN_MOBILE_REGEX.test(phone)) {
    return {
      valid: false,
      reason: "Please enter a valid 10-digit mobile number starting with 6-9.",
      phone,
    };
  }

  // Check known fake numbers
  if (KNOWN_FAKE_NUMBERS.includes(phone)) {
    return {
      valid: false,
      reason: "This phone number is not allowed.",
      phone,
    };
  }

  // Check fake patterns
  for (const [patternName, regex] of Object.entries(FAKE_PATTERNS)) {
    if (regex.test(phone)) {
      return {
        valid: false,
        reason: "This phone number appears to be fake.",
        phone,
      };
    }
  }

  // Check unique digit count
  const uniqueDigits = new Set(phone.split("")).size;
  if (uniqueDigits <= MIN_UNIQUE_DIGITS) {
    return {
      valid: false,
      reason: "Phone number has too few unique digits.",
      phone,
    };
  }

  // Check Shannon entropy
  const entropy = shannonEntropy(phone);
  if (entropy < MIN_ENTROPY) {
    return {
      valid: false,
      reason: "Phone number appears to be fake (low entropy).",
      phone,
    };
  }

  return { valid: true, reason: "", phone };
}
