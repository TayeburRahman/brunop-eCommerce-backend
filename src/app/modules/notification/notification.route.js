const express = require("express"); 
const { NotificationController } = require("./notificaiton.controller");
const checkAdminAccess = require("../../middlewares/checkAdminAccess");
const { ENUM_USER_ROLE } = require("../../../utils/enums");
const auth = require("../../middlewares/auth");

const router = express.Router();

router  
.get(
  "/get-user",
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.MANAGER),
  NotificationController.getUserNotifications
) 
.post(
  "/create-feedback",
  auth(ENUM_USER_ROLE.USER),
  NotificationController.createFeedBacks
)
.patch(
  "/replay-feedback",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER),
  NotificationController.replayFeedback
)
.get(
  "/feedback",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER),
  NotificationController.allFeedback
);
 
 

module.exports = router;
