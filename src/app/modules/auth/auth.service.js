const bcrypt = require("bcrypt");
const cron = require("node-cron");
const httpStatus = require("http-status");
const ApiError = require("../../../errors/ApiError");
const config = require("../../../config");
const { jwtHelpers } = require("../../../helpers/jwtHelpers");
const { sendEmail } = require("../../../utils/sendEmail");
const { ENUM_USER_ROLE } = require("../../../utils/enums");
const { sendResetEmail } = require("../../../utils/sendResetMails");
const { logger } = require("../../../shared/logger");
const Auth = require("./auth.model");
const createActivationToken = require("../../../utils/createActivationToken");
const Manager= require("../manager/manager.model");
const User = require("../user/user.model");
const Admin = require("../admin/admin.model");
const {
  registrationSuccessEmailBody,
} = require("../../../mails/email.register");
const { resetEmailTemplate } = require("../../../mails/reset.email");
const { default: mongoose } = require("mongoose");

const registrationAccount = async (payload) => {
  const { role, password, confirmPassword, email, ...other } = payload;

  if (!role || !Object.values(ENUM_USER_ROLE).includes(role)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Valid Role is required!");
  }
  if (!password || !confirmPassword || !email) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Email, Password, and Confirm Password are required!"
    );
  }
  if (password !== confirmPassword) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Password and Confirm Password didn't match"
    );
  }
  const existingAuth = await Auth.findOne({ email }).lean();
  if (existingAuth?.isActive) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already exists");
  }
  if (existingAuth && !existingAuth.isActive) {
    await Promise.all([
      existingAuth.role === "USER" &&
      User.deleteOne({ authId: existingAuth._id }),
      existingAuth.role === "MANAGER" &&
      Manager.deleteOne({ authId: existingAuth._id }),
      existingAuth.role === "ADMIN" || existingAuth.role === "SUPER_ADMIN" &&
      Admin.deleteOne({ authId: existingAuth._id }),
      Auth.deleteOne({ email }),
    ]);
  }

  const { activationCode } = createActivationToken();
  const auth = {
    role,
    name: other.name,
    email,
    activationCode,
    password,
    expirationTime: Date.now() + 3 * 60 * 1000,
  };

  if (role === "USER") {
    sendEmail({
      email: auth.email,
      subject: "Activate Your Account",
      html: registrationSuccessEmailBody({
        user: { name: auth.name },
        activationCode,
      }),
    }).catch((error) => console.error("Failed to send email:", error.message));
  }

  let createAuth;
  if (role === ENUM_USER_ROLE.ADMIN || role === ENUM_USER_ROLE.SUPER_ADMIN || role === ENUM_USER_ROLE.MANAGER) {
    auth.isActive = true
    createAuth = await Auth.create(auth);
  } else {
    createAuth = await Auth.create(auth);
  }
  if (!createAuth) {
    throw new ApiError(500, "Failed to create auth account");
  }

  other.authId = createAuth._id;
  other.email = email;

  // Role-based user creation
  let result;
  switch (role) {
    case ENUM_USER_ROLE.USER:
      result = await User.create(other);
      break;
    case ENUM_USER_ROLE.ADMIN:
      result = await Admin.create(other);
      break;
    case ENUM_USER_ROLE.SUPER_ADMIN:
      result = await Admin.create(other);
      break;
    case ENUM_USER_ROLE.MANAGER:
      result = await Manager.create(other);
      break;
    default:
      throw new ApiError(400, "Invalid role provided!");
  }

  return { result, role, message: "Account created successfully!" };
};

const activateAccount = async (payload) => {
  const { activation_code, userEmail } = payload;

  const existAuth = await Auth.findOne({ email: userEmail });
  if (!existAuth) {
    throw new ApiError(400, "User not found");
  }
  if (existAuth.activationCode !== activation_code) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Code didn't match!");
  }
  const auth = await Auth.findOneAndUpdate(
    { email: userEmail },
    { isActive: true },
    {
      new: true,
      runValidators: true,
    }
  );
  let result = {};

  if (existAuth.role === ENUM_USER_ROLE.USER) {
    result = await User.findOne({ authId: existAuth._id });
  } else if (
    existAuth.role === ENUM_USER_ROLE.ADMIN ||
    existAuth.role === ENUM_USER_ROLE.SUPER_ADMIN
  ) {
    result = await Admin.findOne({ authId: existAuth._id });
  } else if (existAuth.role === ENUM_USER_ROLE.MANAGER) {
    result = await Manager.findOne({ authId: existAuth._id });
  } else {
    throw new ApiError(400, "Invalid role provided!");
  }

  const accessToken = jwtHelpers.createToken(
    {
      authId: existAuth._id,
      role: existAuth.role,
      userId: result._id,
    },
    config.jwt.secret,
    config.jwt.expires_in
  );

  const refreshToken = jwtHelpers.createToken(
    { authId: existAuth._id, userId: result._id, role: existAuth.role },
    config.jwt.refresh_secret,
    config.jwt.refresh_expires_in
  );


  return {
    id: auth._id,
    role: auth.role,
    accessToken,
    refreshToken,
    user: result,
  };
};

const loginAccount = async (payload) => {
  const { email, password } = payload;

  const isAuth = await Auth.isAuthExist(email);
 
  if (!isAuth) {
    throw new ApiError(404, "User does not exist");
  }
  if (!isAuth.isActive) {
    throw new ApiError(401, "Please activate your account then try to login");
  }
  if (isAuth.is_block) {
    throw new ApiError(403, "You are blocked. Contact support");
  }
  if (
    isAuth.password &&
    !(await Auth.isPasswordMatched(password, isAuth.password))
  ) {
    throw new ApiError(401, "Password is incorrect");
  }

  const { _id: authId } = isAuth;
 
  let userDetails;
  let role;
  switch (isAuth.role) {
    case ENUM_USER_ROLE.USER:
      userDetails = await User.findOne({ authId: isAuth._id })
      role = ENUM_USER_ROLE.USER;
      break;
    case ENUM_USER_ROLE.MANAGER:
      userDetails = await Manager.findOne({ authId: isAuth._id })
      role = ENUM_USER_ROLE.MANAGER;
      break;
    case ENUM_USER_ROLE.ADMIN:
      userDetails = await Admin.findOne({ authId: isAuth._id })
      role = ENUM_USER_ROLE.ADMIN;
      break;
    case ENUM_USER_ROLE.SUPER_ADMIN:
      userDetails = await Admin.findOne({ authId: isAuth._id })
      role = ENUM_USER_ROLE.SUPER_ADMIN;
      break;
    default:
      throw new ApiError(400, "Invalid role provided!");
  }

  console.log("===Hello ==", isAuth._id);

  const accessToken = jwtHelpers.createToken(
    { authId, role, userId: userDetails._id },
    config.jwt.secret,
    config.jwt.expires_in
  );

  const refreshToken = jwtHelpers.createToken(
    { authId, role, userId: userDetails._id },
    config.jwt.refresh_secret,
    config.jwt.refresh_expires_in
  );
  return {
    id: isAuth._id,
    role: isAuth.role,
    accessToken,
    refreshToken,
    user: userDetails,
  };
};

const forgotPass = async (payload) => {
  const user = await Auth.findOne(
    { email: payload.email },
    { _id: 1, role: 1, email: 1, name: 1 }
  );

  if (!user?.email) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User does not found!");
  }

  const verifyCode = createActivationToken().activationCode;
  const verifyExpire = new Date(Date.now() + 15 * 60 * 1000);
  user.verifyCode = verifyCode;
  user.verifyExpire = verifyExpire;

  await user.save();

  const data = {
    name: user.name,
    verifyCode,
    verifyExpire: Math.round((verifyExpire - Date.now()) / (60 * 1000)),
  };

  try {
    sendEmail({
      email: payload.email,
      subject: "Password reset code",
      html: resetEmailTemplate(data),
    });
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
};

const checkIsValidForgetActivationCode = async (payload) => {
  const account = await Auth.findOne({ email: payload.email });

  if (!account) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Account does not exist!");
  }

  if (account.verifyCode !== payload.code) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid reset code!");
  }

  const currentTime = new Date();
  if (currentTime > account.verifyExpire) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Reset code has expired!");
  }
  const update = await Auth.updateOne(
    { email: account.email },
    { codeVerify: true }
  );
  account.verifyCode = null;
  await account.save();
  return update;
};

const resetPassword = async (req) => {
  const { email } = req.query;
  const { newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Passwords do not match");
  }

  const auth = await Auth.findOne({ email }, { _id: 1, codeVerify: 1 });
  if (!auth) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User not found!");
  }

  if (!auth.codeVerify) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Your OTP is not verified!");
  }

  const hashedPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  const result = await Auth.updateOne(
    { email },
    { password: hashedPassword, codeVerify: false }
  );
  return result;
};

const changePassword = async (user, payload) => {
  const { authId } = user;
  const { oldPassword, newPassword, confirmPassword } = payload;
 
  if (newPassword !== confirmPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Password and confirm password do not match.");
  }
 
  const isUserExist = await Auth.findById(authId).select("+password");
  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "Account does not exist!");
  }
 
  if (
    isUserExist.password &&
    !(await Auth.isPasswordMatched(oldPassword, isUserExist.password))
  ) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Old password is incorrect.");
  }
 
  const hashedPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds)
  );
 
  await Auth.findByIdAndUpdate(authId, { password: hashedPassword });

  return { message: "Password updated successfully." };
};

const resendCodeActivationAccount = async (payload) => {
  const email = payload.email;
  const user = await Auth.findOne({ email });

  if (!user.email) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email not found!");
  }

  const activationCode = createActivationToken().activationCode;
  const expiryTime = new Date(Date.now() + 3 * 60 * 1000);
  user.activationCode = activationCode;
  user.verifyExpire = expiryTime;
  await user.save();

  sendResetEmail(
    user.email,
    `<!DOCTYPE html>
     <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Activation Code</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 20px;
            }
            .container {
                max-width: 600px;
                margin: auto;
                background: white;
                padding: 20px;
                border-radius: 5px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            h1 {
                color: #333;
            }
            p {
                color: #555;
                line-height: 1.5;
            }
            .footer {
                margin-top: 20px;
                font-size: 12px;
                color: #999;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Hello, ${user.name}</h1>
            <p>Your activation code is: <strong>${activationCode}</strong></p>
            <p>Please use this code to activate your account. If you did not request this, please ignore this email.</p>
            <p>Thank you!</p>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} bdCalling</p>
            </div>
        </div>
    </body>
    </html>
      `
  );
};

const resendCodeForgotAccount = async (payload) => {
  const email = payload.email;

  if (!email) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email not found!");
  }
  const user = await Auth.findOne({ email });
  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User not found!");
  }
  const verifyCode = createActivationToken().activationCode;
  const expiryTime = new Date(Date.now() + 3 * 60 * 1000);
  user.verifyCode = verifyCode;
  user.verifyExpire = expiryTime;
  await user.save();

  sendResetEmail(
    user.email,
    `<!DOCTYPE html>
     <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Activation Code</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 20px;
            }
            .container {
                max-width: 600px;
                margin: auto;
                background: white;
                padding: 20px;
                border-radius: 5px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            h1 {
                color: #333;
            }
            p {
                color: #555;
                line-height: 1.5;
            }
            .footer {
                margin-top: 20px;
                font-size: 12px;
                color: #999;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Hello, ${user.name}</h1>
            <p>Your activation code is: <strong>${verifyCode}</strong></p>
            <p>Please use this code to activate your account. If you did not request this, please ignore this email.</p>
            <p>Thank you!</p>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} bdCalling</p>
            </div>
        </div>
    </body>
    </html>
      `
  );
}; 
// Scheduled task to unset activationCode field
cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();
    const result = await Auth.updateMany(
      {
        isActive: false,
        expirationTime: { $lte: now },
        activationCode: { $ne: null },
      },
      {
        $unset: { activationCode: "" },
      }
    );

    if (result.modifiedCount > 0) {
      logger.info(
        `Removed activation codes from ${result.modifiedCount} expired inactive users`
      );
    }
  } catch (error) {
    logger.error("Error removing activation codes from expired users:", error);
  }
});
// Scheduled task to unset codeVerify field
cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();
    const result = await Auth.updateMany(
      {
        isActive: false,
        verifyExpire: { $lte: now },
      },
      {
        $unset: { codeVerify: false },
      }
    );

    if (result.modifiedCount > 0) {
      logger.info(
        `Removed activation codes from ${result.modifiedCount} expired inactive users`
      );
    }
  } catch (error) {
    logger.error("Error removing activation codes from expired users:", error);
  }
});

const myProfile = async (req) => {
  const { authId } = req.user; 
  // Find the authenticated user
  const authUser = await Auth.findById(authId);
  if (!authUser) {
    throw new ApiError(404, "Authenticated user not found");
  }

  let userDetails = null;
 
  switch (authUser.role) {
    case ENUM_USER_ROLE.USER:
      userDetails = await User.findOne({ authId: authUser._id }).populate("authId");
      break;
    case ENUM_USER_ROLE.MANAGER:
      userDetails = await Manager.findOne({ authId: authUser._id }).populate("authId");
      break;
    case ENUM_USER_ROLE.ADMIN:
      userDetails = await Admin.findOne({ authId: authUser._id }).populate("authId");
      break;
    default:
      throw new ApiError(400, "Invalid role provided!");
  }

  if (!userDetails) {
    throw new ApiError(404, "User details not found");
  }

  return userDetails;
};

const profileDetails = async (req) => {
  const { authId } = req.query; 
  // Find the authenticated user
  console.log("authId==",authId)
  const authUser = await Auth.findById(authId);
  if (!authUser) {
    throw new ApiError(404, "Authenticated user not found");
  }

  let userDetails = null;
 
  switch (authUser.role) {
    case ENUM_USER_ROLE.USER:
      userDetails = await User.findOne({ authId: authUser._id }).populate("authId");
      break;
    case ENUM_USER_ROLE.MANAGER:
      userDetails = await Manager.findOne({ authId: authUser._id }).populate("authId");
      break;
    case ENUM_USER_ROLE.ADMIN:
      userDetails = await Admin.findOne({ authId: authUser._id }).populate("authId");
      break;
    default:
      throw new ApiError(400, "Invalid role provided!");
  }

  if (!userDetails) {
    throw new ApiError(404, "User details not found");
  }

  return userDetails;
};

const updateProfile = async (req) => {
  const { files } = req;
  const { userId, authId, role } = req.user;
  const data = req.body;

  if (!data) {
    throw new ApiError(400, "No data provided for the update.");
  }

  const checkAuth = await Auth.findById(authId);
  if (!checkAuth) {
    throw new ApiError(403, "Unauthorized access.");
  }

  const RoleModel = role === "USER" ? User : role === "MANAGER" ? Manager : Admin;

  const checkUser = await RoleModel.findById(userId);
  if (!checkUser) {
    throw new ApiError(404, `User with role ${role} not found.`);
  }

  let profile_image;
  // let cover_image;

  if (files?.profile_image) {
    profile_image = `/images/profile/${files.profile_image[0].filename}`;
  }

  // if (files?.cover_image) {
  //   cover_image = `/images/cover/${files.cover_image[0].filename}`;
  // }

  const updatedData = {
    ...data,
    ...(profile_image && { profile_image }),
    // ...(cover_image && { cover_image }),
  };

  await Auth.findByIdAndUpdate(authId, { name: updatedData.name }, { new: true });

  const profile = await RoleModel.findOneAndUpdate({ authId }, updatedData, {
    new: true,
  }).populate("authId");

  return profile;
};

const deleteMyProfile = async (payload) => {
  const { email, password } = payload; 
  const isUserExist = await Auth.isAuthExist(email);
  if (!isUserExist) {
    throw new ApiError(404, `User with email ${email} does not exist.`);
  }
 
  const isPasswordCorrect =
    isUserExist.password &&
    (await Auth.isPasswordMatched(password, isUserExist.password));

  if (!isPasswordCorrect) {
    throw new ApiError(402, "Password is incorrect.");
  }
 
  const RoleModel =
    isUserExist.role === "MANAGER"
      ? Manager
      : isUserExist.role === "USER"
      ? User
      : Admin;
 
  const session = await mongoose.startSession();
  session.startTransaction();

  try { 
    await RoleModel.deleteOne({ authId: isUserExist._id }).session(session);
 
    await Auth.deleteOne({ email }).session(session);
 
    await session.commitTransaction();
    session.endSession();

    return {
      message: `User with email ${email} has been successfully deleted.`,
    };
  } catch (error) { 
    await session.abortTransaction();
    session.endSession();  
    throw new ApiError( 500, "An unexpected error occurred while deleting the profile. Please try again." );
  }
}; 

const AuthService = {
  registrationAccount,
  loginAccount,
  changePassword,
  forgotPass,
  resetPassword,
  activateAccount,
  checkIsValidForgetActivationCode,
  resendCodeActivationAccount,
  resendCodeForgotAccount,
  profileDetails,
  updateProfile,
  myProfile,
  deleteMyProfile
};

module.exports = { AuthService };
