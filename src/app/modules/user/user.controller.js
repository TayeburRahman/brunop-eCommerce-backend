const { UserService } = require("./user.service");
const sendResponse = require("../../../shared/sendResponse");
const catchAsync = require("../../../shared/catchasync");

// const updateProfile = catchAsync(async (req, res) => {
//   const result = await UserService.updateProfile(req);
//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: "Profile updated successfully",
//     data: result,
//   });
// });
 

const UserController = { 
};

module.exports = { UserController };
