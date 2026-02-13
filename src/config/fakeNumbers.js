/**
 * Fake / prank phone number detection config.
 * Shared logic — IMPORTED by validators (no hardcoding).
 * Frontend version (ES module).
 */

// Known fake/test numbers
export const KNOWN_FAKE_NUMBERS = [
  "1234567890",
  "9876543210",
  "0123456789",
  "1111111111",
  "2222222222",
  "3333333333",
  "4444444444",
  "5555555555",
  "6666666666",
  "7777777777",
  "8888888888",
  "9999999999",
  "6000000000",
  "7000000000",
  "8000000000",
  "9000000000",
  "9123456789",
  "8123456789",
  "7123456789",
  "6123456789",
];

// Patterns to detect mathematically fake numbers
export const FAKE_PATTERNS = {
  // All digits the same: 9999999999
  repeatedDigits: /^(\d)\1{9}$/,
  // Alternating two digits: 1212121212, 9898989898
  alternating: /^(\d)(\d)\1\2\1\2\1\2\1\2$/,
  // Three-digit repetition: 123123123(1), 456456456(4)
  structuredRepetition: /^(\d{3})\1\1\d?$/,
  // Four-digit repetition: 1234123412
  fourDigitRepetition: /^(\d{4})\1{1}\d{0,2}$/,
  // Sequential ascending: 1234567890
  sequentialAsc: /^0123456789$|^1234567890$/,
  // Sequential descending: 9876543210
  sequentialDesc: /^9876543210$|^0987654321$/,
};

// Minimum unique digits required (reject if <=2 unique digits)
export const MIN_UNIQUE_DIGITS = 3;

// Minimum Shannon entropy for a valid phone number
export const MIN_ENTROPY = 2.0;
