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

  const getUserAddress = catchAsync(async (req, res) => {
    const result = await OrdersService.getUserAddress(req.query);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Address Get Successfully",
      data: result,
    });
  });

  const checkUserStatus = catchAsync(async (req, res) => {
    const result = await OrdersService.checkUserStatus(req.query);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Check Status Successfully",
      data: result,
    });
  });

  const createOrder = catchAsync(async (req, res) => {
    const result = await OrdersService.createOrder(req);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Check Status Successfully",
      data: result,
    });
  });

  const getPastOrders = catchAsync(async (req, res) => {
    const result = await OrdersService.getPastOrders(req.user);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Get Successfully",
      data: result,
    });
  });
  const getCurrentOrders = catchAsync(async (req, res) => {
    const result = await OrdersService.getCurrentOrders(req.user);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Get Successfully",
      data: result,
    });
  });

  const getAllOrders = catchAsync(async (req, res) => {
    const result = await OrdersService.getAllOrders(req);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Get Successfully",
      data: result,
    });
  });

  const updateStatus = catchAsync(async (req, res) => {
    const result = await OrdersService.updateStatus(req);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Update Successfully",
      data: result,
    });
  });

   
   
   

   


const OrdersController = {  
    productAddToCart,
    getUserCartData,
    updateAddress,
    getUserAddress,
    checkUserStatus,
    createOrder,
    getPastOrders,
    getCurrentOrders,
    getAllOrders,
    updateStatus
};

module.exports = { OrdersController };