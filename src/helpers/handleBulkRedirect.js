/**
 * Bulk order → WhatsApp redirection helper.
 * If any item has quantity > 5, generate a WhatsApp message
 * and redirect the user instead of placing the order via API.
 */

const WHATSAPP_NUMBER = "917250336842";
const MAX_QTY_PER_ITEM = 5;

/**
 * Check if any cart items exceed the per-item quantity limit.
 * @param {Array<{name: string, quantity: number}>} items
 * @returns {{ hasBulk: boolean, bulkItems: Array<{name: string, quantity: number}> }}
 */
export function checkBulkItems(items) {
  const bulkItems = items.filter((item) => item.quantity > MAX_QTY_PER_ITEM);
  return {
    hasBulk: bulkItems.length > 0,
    bulkItems,
  };
}

/**
 * Generate WhatsApp redirect URL with auto-filled bulk order message.
 * @param {Array<{name: string, quantity: number}>} bulkItems
 * @returns {string} WhatsApp URL
 */
export function getBulkWhatsAppURL(bulkItems) {
  const itemLines = bulkItems
    .map((item) => `${item.name} × ${item.quantity}`)
    .join("\n");

  const message = `I want to place a bulk order:\n\n${itemLines}\n\nPlease confirm availability.`;

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Handle bulk order redirect. Returns true if redirected (caller should abort order).
 * @param {Array<{name: string, quantity: number}>} items
 * @returns {boolean} true if bulk redirect happened
 */
export function handleBulkRedirect(items) {
  const { hasBulk, bulkItems } = checkBulkItems(items);
  if (!hasBulk) return false;

  const url = getBulkWhatsAppURL(bulkItems);
  window.open(url, "_blank");
  return true;
}

export { MAX_QTY_PER_ITEM };
