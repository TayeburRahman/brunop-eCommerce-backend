const { Router } = require("express");
const auth = require("../../middlewares/auth");
const { ENUM_USER_ROLE} = require("../../../utils/enums"); 
const { OrdersController } = require("./order.controller");
const router = Router();
router.patch(
    "/add-to-cart",
    auth(ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.USER),
    OrdersController.productAddToCart
  )
 .get(
    "/get-user-cart",
    auth(ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.USER),
    OrdersController.getUserCartData
  )
  .patch(
    "/user-address",
    auth(ENUM_USER_ROLE.USER),
    OrdersController.updateAddress
  )
  .get(
    "/get-address", 
    OrdersController.getUserAddress
  )
  .get(
    "/check-user-status",
    auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER), 
    OrdersController.checkUserStatus
  )
  .post(
    "/create-order", 
    auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER), 
    OrdersController.createOrder
  )
  .get(
    "/past-orders", 
    auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER), 
    OrdersController.getPastOrders
  )
  .get(
    "/current-orders", 
    auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER), 
    OrdersController.getCurrentOrders
  )
  .get(
    "/get-all", 
    auth( ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER), 
    OrdersController.getAllOrders
  )
  .patch(
    "/update-status", 
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER), 
    OrdersController.updateStatus
  )
// ===============
  .get(
    "/get-premium-oder-deu", 
    auth(ENUM_USER_ROLE.USER,ENUM_USER_ROLE.ADMIN ,ENUM_USER_ROLE.MANAGER), 
    OrdersController.getPremiumOderDeu
  )
  .get(
    "/get-delivery-fee", 
    auth(ENUM_USER_ROLE.USER,ENUM_USER_ROLE.ADMIN ,ENUM_USER_ROLE.MANAGER), 
    OrdersController.getDeliveryFee
  ) 
  .post(
    "/pay-monthly", 
    auth(ENUM_USER_ROLE.USER), 
    OrdersController.payMonthlyPremiumUser
  )  
  .post(
    "/add-shipping-address", 
    auth(ENUM_USER_ROLE.USER), 
    OrdersController.addShippingInfo
  )  
  .get(
    "/get-order-details",   
    OrdersController.getOrderDetails
  )  

  .post(
    "/shipping_cost_payments_success",   
    auth(ENUM_USER_ROLE.USER,ENUM_USER_ROLE.ADMIN ,ENUM_USER_ROLE.MANAGER), 
    OrdersController.shippingCostPaymentsSuccess
  )  


   
   
// Bank Transfer Payment ==========



module.exports = router;