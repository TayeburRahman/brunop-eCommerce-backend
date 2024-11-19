const httpStatus = require("http-status");
const jwt = require("jsonwebtoken");
const config = require("../config");
const ApiError = require("../errors/ApiError");
const Admin = require("../app/modules/admin/admin.model"); 
const User = require("../app/modules/auth/auth.model");
const Manager= require("../app/modules/partner/Manager.model");

const getUserDetailsFromToken = async (token) => {
  if (!token) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid token");
  }
  const decode = await jwt.verify(token, config.jwt.secret);
  let user;
  if (decode?.role && decode?.role === "ADMIN") {
    user = await Admin.findById(decode?.userId);
  }
  if (decode?.role && decode?.role === "MANAGER") {
    user = await Manager.findById(decode?.userId);
  }
  if (decode?.role && decode?.role === "USER") {
    user = await User.findById(decode?.userId);
  }
  return user;
};

module.exports = getUserDetailsFromToken;
