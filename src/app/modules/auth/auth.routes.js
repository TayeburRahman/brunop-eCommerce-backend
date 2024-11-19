const express = require("express");
const auth = require("../../middlewares/auth");
const { ENUM_USER_ROLE } = require("../../../utils/enums");
const { uploadFile } = require("../../middlewares/fileUploader");
const { AuthController } = require("../auth/auth.controller");

const router = express.Router();

router
  .post("/register", AuthController.registrationAccount)
  .post("/activate-user", AuthController.activateAccount)
  .post("/login", AuthController.loginAccount)
  .post("/resend", AuthController.resendActivationCode)
  .post("/active-resend", AuthController.resendCodeActivationAccount)
  .post("/forgot-password", AuthController.forgotPass)
  .post("/forgot-resend", AuthController.resendCodeForgotAccount)
  .post("/verify-otp", AuthController.checkIsValidForgetActivationCode)
  .post("/reset-password", AuthController.resetPassword)
  .patch(
    "/change-password",
    auth(
      ENUM_USER_ROLE.USER,
      ENUM_USER_ROLE.MANAGER,
      ENUM_USER_ROLE.ADMIN,
      ENUM_USER_ROLE.SUPER_ADMIN
    ),
    AuthController.changePassword
  )
  .get(
    "/profile",
    auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN), 
    AuthController.myProfile
  )
  .patch(
    "/edit-profile",
    auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
    uploadFile(),
    AuthController.updateProfile
  )
  .patch(
    "/delete-profile/:id",
    auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN), 
    AuthController.deleteMyProfile
  )


module.exports = router;
