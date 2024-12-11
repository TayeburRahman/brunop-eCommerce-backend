const { Router } = require("express");
const auth = require("../../middlewares/auth");
const { PaymentController } = require("./payment.controller");
const bodyParser = require("body-parser");
const checkAdminAccess = require("../../middlewares/checkAdminAccess");
const { ENUM_USER_ROLE } = require("../../../utils/enums");

const router = Router();

// Stripe Payment -------------
router
  .post(
    '/payment-intent',
    auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.MANAGER),
    PaymentController.makePaymentIntent,
  )
  .post(
    '/success_intent',
    auth(ENUM_USER_ROLE.USER),
    PaymentController.paymentSuccessAndSave,
  );

// Bank Transfer Payment ------------



module.exports = router;
