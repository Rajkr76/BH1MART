/**
 * Name validation utility (frontend).
 * Detects non-human / prank / keyboard-mash names mathematically.
 */

const VOWELS = new Set("aeiouAEIOU");

/**
 * Calculate Shannon entropy of a string.
 */
function shannonEntropy(str) {
  const freq = {};
  for (const ch of str.toLowerCase()) {
    if (ch === " ") continue;
    freq[ch] = (freq[ch] || 0) + 1;
  }
  let entropy = 0;
  const len = Object.values(freq).reduce((a, b) => a + b, 0);
  if (len === 0) return 0;
  for (const ch in freq) {
    const p = freq[ch] / len;
    if (p > 0) entropy -= p * Math.log2(p);
  }
  return entropy;
}

/**
 * Validate a human name.
 * @param {string} rawName
 * @returns {{ valid: boolean, reason: string }}
 */
export function validateName(rawName) {
  if (!rawName || typeof rawName !== "string") {
    return { valid: false, reason: "Name is required." };
  }

  const name = rawName.trim();

  // Must be at least 3 characters
  if (name.length < 3) {
    return { valid: false, reason: "Name must be at least 3 characters." };
  }

  // Only letters and spaces allowed
  if (!/^[A-Za-z\s]+$/.test(name)) {
    return { valid: false, reason: "Name can only contain letters and spaces." };
  }

  const letters = name.replace(/\s/g, "").toLowerCase();

  // Check for 4+ repeating letters
  if (/(.)\1{3,}/.test(letters)) {
    return { valid: false, reason: "Name contains too many repeating characters." };
  }

  // Same character repeated entirely
  if (/^(.)\1+$/.test(letters)) {
    return { valid: false, reason: "Name cannot be a single repeated character." };
  }

  // Must contain at least one vowel
  const hasVowel = letters.split("").some((ch) => VOWELS.has(ch));
  if (!hasVowel) {
    return { valid: false, reason: "Name must contain vowels." };
  }

  // No more than 5 consecutive consonants
  const consonantRun = letters.match(/[^aeiou]{6,}/);
  if (consonantRun) {
    return { valid: false, reason: "Name has too many consonants in a row." };
  }

  // Alphabet diversity for 5+ letter names
  if (letters.length >= 5) {
    const uniqueChars = new Set(letters.split("")).size;
    const diversity = uniqueChars / letters.length;
    if (diversity < 0.4) {
      return { valid: false, reason: "Name appears to be random or fake." };
    }
  }

  // Shannon entropy check
  const entropy = shannonEntropy(name);
  if (letters.length >= 5 && entropy < 2.0) {
    return { valid: false, reason: "Name appears to be fake (low entropy)." };
  }

  // Keyboard mash detection
  const KEYBOARD_ROWS = [
    "qwertyuiop",
    "asdfghjkl",
    "zxcvbnm",
  ];
  const lowerName = letters.toLowerCase();
  for (const row of KEYBOARD_ROWS) {
    for (let i = 0; i <= lowerName.length - 5; i++) {
      const slice = lowerName.slice(i, i + 5);
      const inRow = slice.split("").every((ch) => row.includes(ch));
      if (inRow) {
        const positions = slice.split("").map((ch) => row.indexOf(ch));
        const isSequential = positions.every((pos, idx) => {
          if (idx === 0) return true;
          return Math.abs(pos - positions[idx - 1]) <= 2;
        });
        if (isSequential) {
          return { valid: false, reason: "Name looks like keyboard mash." };
        }
      }
    }
  }

  // Repeating 2-char pattern
  if (/^(.{2})\1{2,}$/.test(letters)) {
    return { valid: false, reason: "Name contains repeating patterns." };
  }

  return { valid: true, reason: "" };
}
