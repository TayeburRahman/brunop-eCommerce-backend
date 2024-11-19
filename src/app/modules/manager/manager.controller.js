const sendResponse = require("../../../shared/sendResponse");
const catchAsync = require("../../../shared/catchasync");
const { PartnerService } = require("./manager.service");

// const updateProfile = catchAsync(async (req, res) => {
//   const result = await PartnerService.updateProfile(req);
//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: "Profile updated successfully",
//     data: result,
//   });
// });

 

const ManagerController = { 
};

module.exports = { ManagerController };
