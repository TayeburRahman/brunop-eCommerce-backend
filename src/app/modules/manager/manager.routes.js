const express = require("express"); 
const auth = require("../../middlewares/auth");
const { ENUM_USER_ROLE } = require("../../../utils/enums"); 
const { ManagerController } = require("./manager.controller");

const router = express.Router();

router
.patch(
    "/get-order-list",
    auth(ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.USER),
    ManagerController.getOrderList
  )

module.exports = router;
