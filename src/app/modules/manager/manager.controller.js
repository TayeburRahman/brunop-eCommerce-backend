const sendResponse = require("../../../shared/sendResponse");
const catchAsync = require("../../../shared/catchasync"); 
const {ManagerService} = require("./manager.service"); 

const getOrderList = catchAsync(async (req, res) => {
  const result = await ManagerService.updateProfile(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "get order successfully",
    data: result,
  });
});

 

const ManagerController = { 
    getOrderList,
};

module.exports = { ManagerController };
