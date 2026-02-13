/**
 * Abuse guard middleware.
 * Tracks failed validation attempts per device fingerprint.
 * 2 invalid attempts → block device for 24 hours.
 * Successful valid order resets counter.
 */

const Attempt = require("../models/Attempt");

const BLOCK_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_FAILED_ATTEMPTS = 2;

/**
 * Check if device is blocked via Attempt collection.
 * Runs BEFORE order validation.
 */
async function checkAbuseBlock(req, res, next) {
  try {
    const deviceId = req.body.fingerprint || req.body.deviceId;
    if (!deviceId) return next();

    const attempt = await Attempt.findOne({ deviceId });
    if (attempt && attempt.blockedUntil) {
      if (new Date() < attempt.blockedUntil) {
        return res.status(403).json({
          message: "Your device has been temporarily blocked due to repeated invalid orders. Try again after 24 hours.",
        });
      }
      // Block expired — reset
      attempt.failedAttempts = 0;
      attempt.blockedUntil = null;
      await attempt.save();
    }

    // Attach for downstream use
    req.abuseAttempt = attempt;
    next();
  } catch (err) {
    console.error("abuseGuard checkAbuseBlock error:", err);
    next(); // Fail open
  }
}

/**
 * Record a failed validation attempt for a device.
 * Call this when order validation fails.
 * @param {string} deviceId
 */
async function recordFailedAttempt(deviceId) {
  if (!deviceId) return;
  try {
    const attempt = await Attempt.findOneAndUpdate(
      { deviceId },
      {
        $inc: { failedAttempts: 1 },
        $setOnInsert: { deviceId },
      },
      { upsert: true, new: true }
    );

    if (attempt.failedAttempts >= MAX_FAILED_ATTEMPTS && !attempt.blockedUntil) {
      attempt.blockedUntil = new Date(Date.now() + BLOCK_DURATION_MS);
      await attempt.save();
    }

    return attempt;
  } catch (err) {
    console.error("abuseGuard recordFailedAttempt error:", err);
  }
}

/**
 * Reset failed attempts on successful order.
 * @param {string} deviceId
 */
async function resetAttempts(deviceId) {
  if (!deviceId) return;
  try {
    await Attempt.findOneAndUpdate(
      { deviceId },
      { failedAttempts: 0, blockedUntil: null }
    );
  } catch (err) {
    console.error("abuseGuard resetAttempts error:", err);
  }
}

module.exports = { checkAbuseBlock, recordFailedAttempt, resetAttempts };
