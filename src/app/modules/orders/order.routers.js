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
 .patch(
    "/get-user-cart",
    auth(ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.USER),
    OrdersController.getUserCartData
  )
  .patch(
    "/user-address",
    auth(ENUM_USER_ROLE.USER),
    OrdersController.updateAddress
  )

   
 

// Bank Transfer Payment ------------



module.exports = router;