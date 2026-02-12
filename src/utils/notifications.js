// Request notification permission on first load
export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
};

// Show a browser notification
export const showNotification = (title, options = {}) => {
  if (!("Notification" in window)) return;

  if (Notification.permission === "granted") {
    const notification = new Notification(title, {
      icon: "/icon-192.svg",
      badge: "/icon-192.svg",
      vibrate: [200, 100, 200],
      requireInteraction: false,
      ...options,
    });

    // Auto-close after 5 seconds
    setTimeout(() => notification.close(), 5000);

    return notification;
  }
};

// Notification for new order (admin)
export const notifyNewOrder = (chatId, customerName, total) => {
  showNotification("🛒 New Order Received!", {
    body: `${customerName} placed an order of ₹${total}\nChat ID: ${chatId}`,
    tag: `order-${chatId}`,
    data: { url: `/admin` },
  });
};

// Notification for new message
export const notifyNewMessage = (sender, message, role) => {
  const isAdmin = role === "admin";
  showNotification(
    isAdmin ? `💬 Message from ${sender}` : "💬 New message from Admin",
    {
      body: message.substring(0, 100),
      tag: `message-${Date.now()}`,
      data: { url: `/chat` },
    }
  );
};

// Notification for order status update (customer)
export const notifyOrderStatus = (status, chatId) => {
  const statusMessages = {
    pending: "⏳ Your order is pending",
    preparing: "👨‍🍳 Your order is being prepared",
    delivered: "✅ Your order has been delivered!",
    cancelled: "❌ Your order was cancelled",
  };

  showNotification("Order Status Update", {
    body: statusMessages[status] || "Your order status has changed",
    tag: `status-${chatId}`,
    data: { url: `/chat?id=${chatId}` },
  });
};
