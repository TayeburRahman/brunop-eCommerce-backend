const sendResponse = require("../../../shared/sendResponse");
const { AdminService } = require("./admin.service");
const catchAsync = require("../../../shared/catchasync");

// const myProfile = catchAsync(async (req, res) => {
//   const result = await AdminService.myProfile(req);
//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: "Successful!",
//     data: result,
//   });
// });

 

const AdminController = { 
};

module.exports = { AdminController };
