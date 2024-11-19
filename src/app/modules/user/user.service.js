const ApiError = require("../../../errors/ApiError");
const User = require("./user.model");
const httpStatus = require("http-status");
const Auth = require("../auth/auth.model");
 
// const getProfile = async (user) => {
//   const { userId } = user;
//   const result = await User.findById(userId).populate("authId");
//   if (!result) {
//     throw new ApiError(httpStatus.NOT_FOUND, "User not found");
//   }

//   const auth = await Auth.findById(result.authId);
//   if (auth.is_block) {
//     throw new ApiError(httpStatus.FORBIDDEN, "You are blocked. Contact support");
//   }
//   console.log(auth);
//   return result;
// };

 

const UserService = { 
};

module.exports = { UserService };
