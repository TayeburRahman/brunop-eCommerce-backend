const httpStatus = require("http-status");
const Manager= require("../manager/manager.model");
const User = require("../user/user.model"); 
const { ENUM_PAYMENT_STATUS, ENUM_USER_ROLE } = require("../../../utils/enums");
const config = require("../../../config");
const ApiError = require("../../../errors/ApiError");
const { Transaction } = require("./payment.model");
const { assign } = require("nodemailer/lib/shared");
const stripe = require("stripe")(config.stripe.stripe_secret_key);
const paypal = require('paypal-rest-sdk');
const express = require('express');



const DOMAIN_URL = process.env.RESET_PASS_UI_LINK;
paypal.configure({
  'mode': config.paypal.paypal_mode,
  'client_id': config.paypal.paypal_client_id,
  'client_secret': config.paypal.paypal_client_secret_key
}); 
 
// Bank Transfer Payment ------------
const PaymentService = {
  // createConnectedAccountWithBank, 
}

module.exports = PaymentService;

