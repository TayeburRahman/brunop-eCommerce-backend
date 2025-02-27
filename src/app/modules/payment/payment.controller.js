const catchAsync = require("../../../shared/catchasync");
const sendResponse = require("../../../shared/sendResponse"); 
const PaymentService = require("./payment.service");

 
const makePaymentIntent = catchAsync(async (req, res) => {
  const result = await PaymentService.makePaymentIntent(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Payment intent create successfully',
    data: result,
  }); 
});

const monthlyPaymentSave = catchAsync(async (req, res) => {
  const result = await PaymentService.monthlyPaymentSave(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Payment intent create successfully',
    data: result,
  }); 
});

const getTransitionList = catchAsync(async (req, res) => {
  const result = await PaymentService.getTransitionList(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Get successfully',
    data: result,
  });
});

 

// const paymentSuccessAndSave = catchAsync(async (req, res) => {
//   const result = await PaymentService.paymentSuccessAndSave(req.body);
//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: 'Save successfully',
//     data: result,
//   });
  
// });

 
  
 

 

  const PaymentController = {  
    makePaymentIntent,
    monthlyPaymentSave,
    getTransitionList
    // paymentSuccessAndSave,
     
  };
  
  module.exports = { PaymentController };

//   module.exports = { createCheckoutSession,checkAndUpdateStatusByWebhook };