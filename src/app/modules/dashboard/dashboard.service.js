const httpStatus = require("http-status");

const Auth = require("../auth/auth.model");
const User = require("../user/user.model");
const QueryBuilder = require("../../../builder/queryBuilder");
const ApiError = require("../../../errors/ApiError");
const Manager= require("../manager/manager.model");
const Admin = require("../admin/admin.model");
const { TermsConditions, PrivacyPolicy, Faq } = require("../manage/manage.model");
const { ENUM_MANAGER_AC_STATUS } = require("../../../utils/enums");
const { sendEmail } = require("../../../utils/sendEmail");
const approvedBody = require("../../../mails/approvedBody");
const { resetEmailTemplate } = require("../../../mails/reset.email");
const disapprovedBody = require("../../../mails/disapprovedBody"); 
const { default: mongoose } = require("mongoose");

// User ManagerAdmin Management ========================

const getAllUsers = async (query) => {
  const userQuery = new QueryBuilder(User.find().populate("authId"), query)
    .search(["name", "email"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await userQuery.modelQuery;
  const meta = await userQuery.countTotal();

  return {
    meta,
    data: result,
  };
};

const getAuthDetails = async (query) => {
  const { authId } = query;

  if (!authId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Missing User Id");
  }
  
  const dataDb = await Auth.findById(authId).lean();

  if (!dataDb) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  let model;
  switch (dataDb.role) {
    case "ADMIN":
      model = Admin;
      break;
    case "MANAGER":
      model = Manager;
      break;
    case "USER":
      model = User;
      break;
    default:
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid role");
  }

  const userDetails = await model.findOne({ authId }).populate("authId");

  if (!userDetails) {
    throw new ApiError(httpStatus.NOT_FOUND, `${dataDb.role} not found`);
  }

  return userDetails;
};
 
const blockUnblockAuthProfile = async (payload) => {
  const { role, email, is_block } = payload;

  const updatedAuth = await Auth.findOneAndUpdate(
    { email: email, role: role },
    { $set: { is_block } },
    {
      new: true,
      runValidators: true,
    }
  ).select("role name email is_block");

  if (!updatedAuth) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  return updatedAuth;
};

const getAllManager= async (query) => {
  const partnerQuery = new QueryBuilder(
    Manager.find().populate("authId"),
    query
  )
    .search(["name", "email"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await partnerQuery.modelQuery;
  const meta = await partnerQuery.countTotal();

  if (!result?.length) {
    throw new ApiError(httpStatus.NOT_FOUND, "Manager not found");
  }

  return {
    meta,
    data: result,
  };
};
  
const getAllAdmins = async (query) => {
  const adminQuery = new QueryBuilder(Admin.find({}).populate("authId"), query)
    .search(["name", "email"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await adminQuery.modelQuery;
  const meta = await adminQuery.countTotal();

  if (!result?.length) {
    throw new ApiError(httpStatus.NOT_FOUND, "Managernot found");
  }

  return {
    meta,
    data: result,
  };
};

const deleteProfile = async (payload) => {
  const { email } = payload;
 
  const isUserExist = await Auth.isAuthExist(email);
  if (!isUserExist) {
    throw new ApiError(404, `User with email ${email} does not exist.`);
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

    return { message: `User with email ${email} has been deleted.` };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new ApiError(500, "Failed to delete user profile. Please try again.");
  }
};

const getAllPendingManager = async (query) => {
  const userQuery = new QueryBuilder(
    Manager.find({ status: { $eq: ENUM_MANAGER_AC_STATUS.PENDING } }).populate(
      "authId"
    ),
    query
  )
    .search(["name", "email"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await userQuery.modelQuery;
  const meta = await userQuery.countTotal();

  if (!result.length) {
    throw new ApiError(httpStatus.NOT_FOUND, "No pending Manager requests");
  }

  return {
    meta,
    data: result,
  };
};
  
const addTermsConditions = async (payload) => {
  const checkIsExist = await TermsConditions.findOne();
  if (checkIsExist) {
    const result = await TermsConditions.findOneAndUpdate({}, payload, {
      new: true,
      runValidators: true,
    });

    return {
      message: "Terms & conditions updated",
      result,
    };
  } else {
    return await TermsConditions.create(payload);
  }
};

const getTermsConditions = async () => {
  return await TermsConditions.findOne();
};

const deleteTermsConditions = async (query) => {
  const { id } = query;

  const result = await TermsConditions.findByIdAndDelete(id);

  if (!result) {
    throw new ApiError(404, "TermsConditions not found");
  }

  return result;
};

const addPrivacyPolicy = async (payload) => {
  const checkIsExist = await PrivacyPolicy.findOne();

  if (checkIsExist) {
    const result = await PrivacyPolicy.findOneAndUpdate({}, payload, {
      new: true,
      runValidators: true,
    });

    return {
      message: "Privacy policy updated",
      result,
    };
  } else {
    return await PrivacyPolicy.create(payload);
  }
};

const getPrivacyPolicy = async () => {
  return await PrivacyPolicy.findOne();
};

const deletePrivacyPolicy = async (query) => {
  const { id } = query;

  const result = await PrivacyPolicy.findByIdAndDelete(id);

  if (!result) {
    throw new ApiError(404, "Privacy Policy not found");
  }

  return result;
};

const addFaq = async (payload) => {
  console.log(payload)
  if (!payload?.questions || !payload?.answer){
    throw new Error("Question and answer are required");
  }
 
   return await Faq.create(payload); 
};

const updateFaq = async (req) => {
  const id =  req.params.id
 
  const payload =  req.body
  if (!payload?.questions || !payload?.answer){
    throw new Error("Question and answer are required");
  }

  const result = await Faq.findByIdAndUpdate(id, payload, { new: true });

   return result
};

const deleteFaq = async (req) => {
  const id = req.params.id
   return await Faq.findByIdAndDelete(id);
};

const getFaq = async () => {
  return await Faq.find();
};

// Auction Management ========================
 
 



 

const DashboardService = {
  getAllUsers,
  getAuthDetails,
  deleteProfile,
  getAllManager, 
  getAllPendingManager, 
  getAllAdmins, 
  blockUnblockAuthProfile,
  addTermsConditions,
  getTermsConditions,
  deleteTermsConditions,
  addPrivacyPolicy,
  getPrivacyPolicy,
  deletePrivacyPolicy, 
  addFaq,
  updateFaq,
  deleteFaq,
  getFaq, 
};

module.exports = { DashboardService };
