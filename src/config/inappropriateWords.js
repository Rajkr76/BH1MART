// List of inappropriate/profane words to block
export const INAPPROPRIATE_WORDS = [
  // Sexual content
  "sex", "porn", "xxx", "dildo", "vibrator", "condom",
  "dick", "cock", "pussy", "penis", "vagina",
  
  // Drugs/alcohol
  "weed", "marijuana", "cannabis", "cocaine", "heroin",
  "meth", "mdma", "ecstasy", "lsd", "drug",
  "alcohol", "beer", "whisky", "vodka", "rum",
  "wine", "cigarette", "cigar", "tobacco", "vape",
  
  // Offensive/abusive
  "fuck", "shit", "bitch", "asshole", "bastard",
  "damn", "hell", "crap", "whore", "slut",
  
  // Other inappropriate items
  "weapon", "gun", "knife", "blade", "bomb",
];

/**
 * Check if text contains inappropriate words
 * @param {string} text - Text to validate
 * @returns {{valid: boolean, reason?: string}} Validation result
 */
export function validateInappropriateContent(text) {
  if (!text || typeof text !== "string") {
    return { valid: false, reason: "Text is required" };
  }

  const normalized = text.toLowerCase().trim();
  
  // Check for exact matches and partial matches
  for (const word of INAPPROPRIATE_WORDS) {
    // Use word boundaries to avoid false positives (e.g., "analysis" containing "anal")
    const regex = new RegExp(`\\b${word}\\b`, "i");
    if (regex.test(normalized)) {
      return { 
        valid: false, 
        reason: `Inappropriate content detected. Please use appropriate language.` 
      };
    }
  }

  return { valid: true };
}
