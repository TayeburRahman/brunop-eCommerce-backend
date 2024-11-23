const httpStatus = require("http-status");
const Manager= require("../manager/manager.model");
const User = require("../user/user.model"); 
const { ENUM_PAYMENT_STATUS, ENUM_USER_ROLE } = require("../../../utils/enums");
const config = require("../../../config");
const stripe = require("stripe")(config.stripe.stripe_secret_key);  
 

//==Payment Checkout Session ===============
const makePaymentIntent = async (payload) => {

  const amount = Math.trunc(payload.amount * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    payment_method_types: ['card'],
  });

  const data = {
    client_secret: paymentIntent.client_secret,
    transactionId: paymentIntent.id,
  };

  return data;
};

 
 
const PaymentService = {
  makePaymentIntent, 
}

module.exports = PaymentService;

