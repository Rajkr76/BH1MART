/**
 * Client-side block tracking utility.
 * Tracks failed validation attempts and enforces 24h blocks.
 * High severity - like major companies do for fraud prevention.
 */

const BLOCK_STORAGE_KEY = "b1mart_client_block";
const MAX_FAILED_ATTEMPTS = 2;
const BLOCK_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Check if the client is currently blocked
 * @returns {{ isBlocked: boolean, blockedUntil: Date | null, attempts: number }}
 */
export function checkClientBlock() {
  try {
    const stored = localStorage.getItem(BLOCK_STORAGE_KEY);
    if (!stored) {
      return { isBlocked: false, blockedUntil: null, attempts: 0 };
    }

    const data = JSON.parse(stored);
    const blockedUntil = data.blockedUntil ? new Date(data.blockedUntil) : null;

    // Check if block has expired
    if (blockedUntil && new Date() >= blockedUntil) {
      // Block expired - clear it
      localStorage.removeItem(BLOCK_STORAGE_KEY);
      return { isBlocked: false, blockedUntil: null, attempts: 0 };
    }

    // Still blocked
    if (blockedUntil && new Date() < blockedUntil) {
      return { isBlocked: true, blockedUntil, attempts: data.attempts || 0 };
    }

    return { isBlocked: false, blockedUntil: null, attempts: data.attempts || 0 };
  } catch {
    return { isBlocked: false, blockedUntil: null, attempts: 0 };
  }
}

/**
 * Record a failed validation attempt (fake name/phone)
 * Blocks after MAX_FAILED_ATTEMPTS
 */
export function recordFailedValidation() {
  try {
    const current = checkClientBlock();
    
    // If already blocked, don't increment
    if (current.isBlocked) return;

    const newAttempts = current.attempts + 1;
    
    // Block after 2nd attempt
    if (newAttempts >= MAX_FAILED_ATTEMPTS) {
      const blockedUntil = new Date(Date.now() + BLOCK_DURATION_MS);
      localStorage.setItem(BLOCK_STORAGE_KEY, JSON.stringify({
        attempts: newAttempts,
        blockedUntil: blockedUntil.toISOString(),
        blockedAt: new Date().toISOString(),
      }));
    } else {
      // Just increment attempts
      localStorage.setItem(BLOCK_STORAGE_KEY, JSON.stringify({
        attempts: newAttempts,
        blockedUntil: null,
      }));
    }
  } catch (err) {
    console.error("Failed to record validation attempt:", err);
  }
}

/**
 * Reset attempts (call on successful order)
 */
export function resetClientAttempts() {
  try {
    localStorage.removeItem(BLOCK_STORAGE_KEY);
  } catch (err) {
    console.error("Failed to reset attempts:", err);
  }
}

/**
 * Get friendly time remaining until unblock
 */
export function getBlockTimeRemaining(blockedUntil) {
  if (!blockedUntil) return "";
  
  const now = new Date();
  const diff = blockedUntil - now;
  
  if (diff <= 0) return "expired";
  
  const hours = Math.floor(diff / (60 * 60 * 1000));
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}
