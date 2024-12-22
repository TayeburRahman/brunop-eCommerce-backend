const httpStatus = require("http-status");
const Manager= require("../manager/manager.model");
const User = require("../user/user.model"); 
const { ENUM_PAYMENT_STATUS, ENUM_USER_ROLE } = require("../../../utils/enums");
const config = require("../../../config");
const { Transaction } = require("./payment.model");
const { Orders } = require("../orders/order.model");
const QueryBuilder = require("../../../builder/queryBuilder");
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

const monthlyPaymentSave = async (payload) => {
  const { orderId, paymentDetails } = payload;
 
  const orders = await Orders.find({ _id: { $in: orderId } });
 
  if (orders.length !== orderId.length) {
    const existingOrderIds = orders.map((order) => order._id.toString());
    const missingOrderIds = orderId.filter((id) => !existingOrderIds.includes(id));
    throw new ApiError(404, `Orders not found for the following IDs: ${missingOrderIds.join(', ')}`);
  }
 
  for (const order of orders) { 
    order.payment = "Completed";
    order.paymentDetails = paymentDetails;
    await order.save();
  }

  return { success: true, message: 'Payments saved successfully for all orders.' };
};




// const paymentSuccessAndSave = async (payload) => { 
//   const requiredFields = ["amount", "userId", "transaction_id", "orderId"];
//   for (const field of requiredFields) {
//     if (!payload[field]) {
//       throw new Error(`${field} field is required.`);
//     }
//   }
 
//   const subscriptionPlan = await Orders.findById(payload.orderId);
//   if (!subscriptionPlan) {
//     throw new Error("Subscription plan not found.");
//   }
 
//   const transaction = await Transaction.create({
//     paymentStatus: "Completed",
//     orderId: payload.orderId,
//     userId: payload.userId,
//     amount: payload.amount,
//     paymentDetails: {
//       transaction_id: payload.transaction_id,
//       currency: "USD",
//       paymentMethod: "Stripe",
//     },
//   });

//   if (!transaction) {
//     throw new Error("Failed to save the transaction.");
//   }

//   return { payment: subscriptionPlan, transaction };
// };

 

// const getTransitionList = async (req) => { 
//   const query = req.query;
//   const userQuery = new QueryBuilder(Transaction.find()
//   .populate("orderId")
//   .populate("userId") 
//   , query)
//   .search(['userId.name', 'userId.email', 'orderId'])
//   .filter()
//   .sort()
//   .paginate()
//   .fields();

// const result = await userQuery.modelQuery;
// const meta = await userQuery.countTotal();

// return {result, meta}

// }


 
const PaymentService = {
  makePaymentIntent, 
  monthlyPaymentSave,
  // paymentSuccessAndSave,
  // getTransitionList
}

module.exports = PaymentService;

