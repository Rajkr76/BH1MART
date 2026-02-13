const DeviceSecurity = require("../models/DeviceSecurity");

/**
 * Middleware: Check if the device fingerprint is blocked.
 * Reads fingerprint from request body.
 * If blocked → returns 403 and stops the request.
 */
async function checkDeviceBlock(req, res, next) {
  try {
    const { fingerprint } = req.body;

    if (!fingerprint) {
      // No fingerprint provided — allow but log a warning
      return next();
    }

    const device = await DeviceSecurity.findOne({ fingerprint });

    if (device && device.isBlocked) {
      return res.status(403).json({ message: "Order access denied." });
    }

    // Attach device record (or null) for downstream use
    req.deviceRecord = device;
    next();
  } catch (err) {
    console.error("checkDeviceBlock error:", err);
    // Don't block on internal errors — fail open but log
    next();
  }
}

module.exports = checkDeviceBlock;
