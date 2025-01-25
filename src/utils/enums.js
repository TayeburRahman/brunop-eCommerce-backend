const ENUM_USER_ROLE = {
  USER: "USER",
  MANAGER: "MANAGER",
  ADMIN: "ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN",
};

const ENUM_MANAGER_AC_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  DECLINED: "declined",
};
const ENUM_CUSTOMER_TYPE = {
  REGULAR: "REGULAR",
  PREMIUM: "PREMIUM", 
};

const ENUM_SOCKET_EVENT = {
  CONNECT: "connection",
  NOTIFICATION: "notification",
  NEW_NOTIFICATION: "new-notification",
  SEEN_NOTIFICATION: "seen-notification",
  MESSAGE_NEW: "new-message",
  MESSAGE_GETALL: "message",
  CONVERSION: "conversion", 
  PARTNER_LOCATION: "partner-location",  
  
};

// --------------------
const ENUM_SERVICE_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  RESCHEDULED: "rescheduled",
  PICK_UP: "pick-up",
  IN_PROGRESS: "in-progress",
  COMPLETED: "completed",
  CANCEL: "cancel",
  CONFIRM_ARRIVED:"confirm-arrived",
  GOODS_LOADED:"goods-loaded",
  PARTNER_AT_DESTINATION:"partner-at-destination",
  DELIVERY_CONFIRMED:"delivery-confirmed",
  ARRIVED:"arrived",
  START_TRIP:"start-trip",
  ARRIVE_AT_DESTINATION:"arrive-at-destination",
  DELIVERED:"delivered", 
};


const ENUM_NOTIFICATION_TYPE = {
  PREMIUM_REQUEST: "premiumRequest",
  NONE: "none",
  ORDER_FAILED: "order_failed",
  ORDER_SUCCESS: "order_success",
  SHIPPING_INFO: "shipping_info",
  SHIPPING_PAYMENT: "shipping_payment",
}

const ENUM_ORDER_STATUS = { 
  NONE: "none",
  PENDING: "Pending",
  PROCESSING: "Processing",
  SHIPPING: "Shipping",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};
 
 

const ENUM_PAYMENT_STATUS = {};

 
module.exports = {
  ENUM_USER_ROLE,
  ENUM_MANAGER_AC_STATUS,
  ENUM_SOCKET_EVENT,
  ENUM_SERVICE_STATUS, 
  ENUM_PAYMENT_STATUS, 
  ENUM_CUSTOMER_TYPE,
  ENUM_NOTIFICATION_TYPE,
  ENUM_ORDER_STATUS
};
