const express = require("express");
const auth = require("../../middlewares/auth");
 
const { notificationController } = require("./notificaiton.controller");
const checkAdminAccess = require("../../middlewares/checkAdminAccess");

const router = express.Router();

router.get(
  "/admin",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.DRIVER, ENUM_USER_ROLE.USER),
 
  notificationController.getAllNotification
);

module.exports = router;
