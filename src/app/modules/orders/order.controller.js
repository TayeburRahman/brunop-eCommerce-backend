const catchAsync = require("../../../shared/catchasync");
const sendResponse = require("../../../shared/sendResponse");
const OrdersService = require("./order.service");

const productAddToCart = catchAsync(async (req, res) => {
    const result = await OrdersService.productAddToCart(req);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Add to cart Successfully",
      data: result,
    });
  });
  
  const getUserCartData = catchAsync(async (req, res) => {
    const result = await OrdersService.getUserCartData(req.user);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Add to cart Successfully",
      data: result,
    });
  });

  const updateAddress = catchAsync(async (req, res) => {
    const result = await OrdersService.updateAddress(req);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Address update Successfully",
      data: result,
    });
  });


const OrdersController = {  
    productAddToCart,
    getUserCartData,
    updateAddress
};

module.exports = { OrdersController };