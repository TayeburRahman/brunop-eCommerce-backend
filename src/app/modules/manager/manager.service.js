const httpStatus = require("http-status");
const ApiError = require("../../../errors/ApiError");
const Auth = require("../auth/auth.model");
const Manager = require("./manager.model");

 

// const getProfile = async (user) => {
//   const userId = user.userId;
//   const result = await Manager.findById(userId).populate("authId");
//   if (!result) {
//     throw new ApiError(httpStatus.NOT_FOUND, "User not found");
//   }

//   const auth = await Auth.findById(result.authId);
//   if (auth.is_block) {
//     throw new ApiError(httpStatus.FORBIDDEN, "You are blocked. Contact support");
//   }

//   return result;
// };

 

const PartnerService = { 
};

module.exports = { PartnerService };
