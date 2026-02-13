/**
 * Device Fingerprint Generator
 * Collects browser/device signals and generates a stable SHA-256 hash.
 * Does NOT use cookies, localStorage, or any persistent storage.
 * Runs entirely in-memory using Web Crypto API.
 */

function getCanvasFingerprint() {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext("2d");
    ctx.textBaseline = "top";
    ctx.font = "14px 'Arial'";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = "#069";
    ctx.fillText("BH1Mart-FP", 2, 15);
    ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
    ctx.fillText("BH1Mart-FP", 4, 17);
    return canvas.toDataURL();
  } catch {
    return "canvas-not-supported";
  }
}

function getWebGLRenderer() {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) return "webgl-not-supported";
    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    if (!debugInfo) return "webgl-no-debug";
    return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || "unknown";
  } catch {
    return "webgl-error";
  }
}

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Generate a stable device fingerprint.
 * @returns {Promise<string>} SHA-256 hex string
 */
export default async function getFingerprint() {
  const signals = [
    navigator.userAgent || "",
    `${screen.width}x${screen.height}x${screen.colorDepth}`,
    Intl.DateTimeFormat().resolvedOptions().timeZone || "",
    navigator.language || "",
    navigator.platform || "",
    String(navigator.hardwareConcurrency || "unknown"),
    String(navigator.deviceMemory || "unknown"),
    getWebGLRenderer(),
    getCanvasFingerprint(),
  ];

  const raw = signals.join("|||");
  return sha256(raw);
}
