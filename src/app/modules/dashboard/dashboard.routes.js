const express = require("express");
const auth = require("../../middlewares/auth");
const { ENUM_USER_ROLE } = require("../../../utils/enums");
const { DashboardController } = require("./dashboard.controller");

const router = express.Router();

router
  // Home page routes
   .get(
    "/count",
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
    DashboardController.getHomePage
   ) 
   .get(
    "/user-growth",
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
    DashboardController.getUserGrowth
   )
   .get(
    "/income-overview",
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
    DashboardController.incomeOverview
   )

   // user manage 
   .get(
    "/get_user_list",
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
    DashboardController.getUserList
  )   
  .patch(
    "/send_premium_request",
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
    DashboardController.sendPremiumRequest
  )   
  .get(
    "/padding_premium_request",
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
    DashboardController.paddingPremiumRequest
  )  
  .patch(
    "/cancle_premium_request",
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
    DashboardController.cancelPremiumRequest
  )  
  .patch(
    "/accept_premium_request",
    auth(ENUM_USER_ROLE.USER,ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.ADMIN),
    DashboardController.acceptPremiumRequest
  )  
    
  // user ========================
  .get(
    "/get_all_user",
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
    DashboardController.getAllUsers
  ) 

  // Manager========================
  .get(
    "/get_all_manager",
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
    DashboardController.getAllManager
  )

  .get(
    "/get_pending_manager",
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
    DashboardController.getAllPendingManager
  )

  // Admin ========================
  .get(
    "/get_all_admin",
    auth(ENUM_USER_ROLE.ADMIN ,ENUM_USER_ROLE.SUPER_ADMIN),
    DashboardController.getAllAdmins
  )

  // Auth common =========
  .get(
    "/get_auth_details",
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
    DashboardController.getAuthDetails
  )
  .delete(
    "/delete_profile",
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
    DashboardController.deleteProfile
  )
  .patch(
    "/block-unblock",
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
    DashboardController.blockUnblockAuthProfile
  )
  // Manage ========================
  .post(
    "/add-terms-conditions",
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
    DashboardController.addTermsConditions
  )
  .get("/get-terms-conditions", DashboardController.getTermsConditions)
  .delete(
    "/delete-terms-conditions",
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
    DashboardController.deleteTermsConditions
  )
  .post(
    "/add-privacy-policy",
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
    DashboardController.addPrivacyPolicy
  )
  .get("/get-privacy-policy", DashboardController.getPrivacyPolicy)
  .delete(
    "/delete-privacy-policy",
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
    DashboardController.deletePrivacyPolicy
  ) 
  .post(
    "/add-faq",
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
    DashboardController.addFaq
  ) 
  .get( "/get-faq", DashboardController.getFaq) 
  .patch(
    "/update-faq/:id",
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
    DashboardController.updateFaq
  )
  .delete(
    "/delete-faq",
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
    DashboardController.deleteFaq
  )

   


// overview ========================

module.exports = router;
