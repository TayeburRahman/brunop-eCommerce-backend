const httpStatus = require("http-status");
const Manager= require("../manager/manager.model");
const User = require("../user/user.model"); 
const { ENUM_PAYMENT_STATUS, ENUM_USER_ROLE } = require("../../../utils/enums");
const config = require("../../../config");
const { Transaction } = require("./payment.model");
const { Orders } = require("../orders/order.model");
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

const paymentSuccessAndSave = async (payload) => { 
  const requiredFields = ["amount", "userId", "transaction_id", "orderId"];
  for (const field of requiredFields) {
    if (!payload[field]) {
      throw new Error(`${field} field is required.`);
    }
  }
 
  const subscriptionPlan = await Orders.findById(payload.orderId);
  if (!subscriptionPlan) {
    throw new Error("Subscription plan not found.");
  }
 
  const transaction = await Transaction.create({
    paymentStatus: "Completed",
    orderId: payload.orderId,
    userId: payload.userId,
    amount: payload.amount,
    paymentDetails: {
      transaction_id: payload.transaction_id,
      currency: "USD",
      paymentMethod: "Stripe",
    },
  });

  if (!transaction) {
    throw new Error("Failed to save the transaction.");
  }

  return { payment: subscriptionPlan, transaction };
};


 
 
const PaymentService = {
  makePaymentIntent, 
  paymentSuccessAndSave
}

module.exports = PaymentService;

