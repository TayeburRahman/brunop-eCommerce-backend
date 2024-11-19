const httpStatus = require("http-status");

const ApiError = require("../../../errors/ApiError");
const Auth = require("../auth/auth.model");
const Admin = require("./admin.model");
 
// const myProfile = async (req) => {
//   const { userId } = req.user;
//   const result = await Admin.findById(userId).populate("authId");
//   if (!result) {
//     throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
//   }

//   return result;
// };
 

const AdminService = { 
};

module.exports = { AdminService };
