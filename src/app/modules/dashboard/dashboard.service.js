const httpStatus = require("http-status");

const Auth = require("../auth/auth.model");
const User = require("../user/user.model");
const QueryBuilder = require("../../../builder/queryBuilder");
const ApiError = require("../../../errors/ApiError");
const Manager = require("../manager/manager.model");
const Admin = require("../admin/admin.model");
const { TermsConditions, PrivacyPolicy, Faq } = require("../manage/manage.model");
const { ENUM_MANAGER_AC_STATUS, ENUM_NOTIFICATION_TYPE } = require("../../../utils/enums");
const { sendEmail } = require("../../../utils/sendEmail");
const approvedBody = require("../../../mails/approvedBody");
const { resetEmailTemplate } = require("../../../mails/reset.email");
const disapprovedBody = require("../../../mails/disapprovedBody");
const { default: mongoose } = require("mongoose");
const { Transaction } = require("../payment/payment.model");
const { Orders } = require("../orders/order.model");
const { NotificationService } = require("../notification/notification.service");
const { sendEmailUser } = require("../../../utils/sendEmailUser");


// Get Home Page========================== 
const getHomePage = async (req, res) => {

  const resultIncome = await Transaction.aggregate([
    {
      $match: {
        paymentStatus: "Completed",
      },
    },
    {
      $group: {
        _id: null,
        totalIncome: { $sum: "$amount" },
      },
    },
  ]);

  const resultUser = await User.aggregate([
    {
      $match: {
        customerType: "REGULAR",
      },
    }
  ]);

  const resultPremiumUser = await User.aggregate([
    {
      $match: {
        paymentStatus: "PREMIUM",
      },
    }
  ]);

  const orderResult = await Orders.find({})

  // Check if resultIncome is empty
  const income = resultIncome.length > 0 ? resultIncome[0].totalIncome : 0;
  const users = resultUser?.length ? resultUser?.length : 0;
  const premiumUser = resultPremiumUser?.length ? resultPremiumUser?.length : 0;
  const order = orderResult?.length ? orderResult?.length : 0;



  return { income, users, premiumUser, order };

};

const incomeOverview = async (year) => {
  try {  
    const currentYear = new Date().getFullYear();
    const selectedYear = Number(year.year) || currentYear;
    console.log(selectedYear);
    const startDate = new Date(`${selectedYear}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${selectedYear + 1}-01-01T00:00:00.000Z`);

    console.log("Start Date:", startDate);
    console.log("End Date:", endDate);
 
    const incomeOverview = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lt: endDate },
          paymentStatus: "Completed",
        },
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          totalIncome: { $sum: "$amount" },
        },
      },
      {
        $project: {
          _id: 0,
          month: "$_id.month",
          totalIncome: 1,
        },
      },
      {
        $sort: { month: 1 },
      },
    ]);

    console.log("Aggregated Income Data:", incomeOverview);
 
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const result = Array.from({ length: 12 }, (_, i) => {
      const monthData = incomeOverview.find((data) => data.month === i + 1) || {
        month: i + 1,
        totalIncome: 0,
      };
      return {
        month: months[i],
        totalIncome: monthData.totalIncome,
      };
    }); 
 
    return {
      year: selectedYear,
      data: result,
    };
  } catch (error) { 
    console.error("Error in incomeOverview function:", error.stack || error);
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Service not found: ${error.message}`
    );
  }
};
 


const getYearRange = (year) => {
  const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
  const endDate = new Date(`${year + 1}-01-01T00:00:00.000Z`);

  return { startDate, endDate };
};

const getUserGrowth = async (year) => {
  try {
    const currentYear = new Date().getFullYear();
    const selectedYear = Number(year.year) || currentYear;
 
    const { startDate, endDate } = getYearRange(selectedYear);

    const monthlyUserGrowth = await Auth.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lt: endDate,
          },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          month: '$_id.month',
          year: '$_id.year',
          count: 1,
        },
      },
      {
        $sort: { month: 1 },
      },
    ]);

    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    const result = [];
    for (let i = 1; i <= 12; i++) {
      const monthData =
        monthlyUserGrowth.find((data) => data.month === i) || {
          month: i,
          count: 0,
          year: selectedYear?.year,
        };
      result.push({
        ...monthData,
        month: months[i - 1],
      });
    }

    return {
      year: selectedYear,
      data: result,
    };
  } catch (error) {
    console.error('Error in getUserGrowth function: ', error);
    throw new ApiError(httpStatus.BAD_REQUEST, "server error:", error.message);
  }
};

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

const getAllManager = async (query) => {
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
    throw new ApiError(404, `Email ${email} does not exist.`);
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
  if (!payload?.questions || !payload?.answer) {
    throw new Error("Question and answer are required");
  }

  return await Faq.create(payload);
};

const updateFaq = async (req) => {
  const id = req.params.id

  const payload = req.body
  if (!payload?.questions || !payload?.answer) {
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

// User Manage ==================
const getUserList = async (req) => {
  const query = req.query

  const userQuery = new QueryBuilder(User.find()
  .populate('authId')
  , query)
    .search(['email', 'name'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await userQuery.modelQuery;
  const meta = await userQuery.countTotal();

  return { result, meta }
};
const sendPremiumRequest = async (req) => {
  const { userId } = req.query;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const premiumRequest = await User.findByIdAndUpdate(
    userId,
    {
      premiumRequest: true,
    }
  );

  const emailSubject = "Offer from admin to make premium user.";

  const emailHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Premium User Request</title>
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
        .button {
            display: inline-block;
            padding: 10px 20px;
            margin-top: 20px;
            background-color: #4CAF50;
            color: white;
            text-decoration: none;
            border-radius: 3px;
        }
        .button:hover {
            background-color: #45a049;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Hello, ${user.name}</h1>
        <p>We are excited to inform you that you have been offered the opportunity to become a Premium User. By accepting the premium offer, you will be able to place orders without making immediate payments. The payment will be billed on a monthly basis.</p>
        
        <p>To accept the premium offer, simply click 'Accept' in the notification within the app.</p> 
        
        <p>If you have any questions or need further assistance, feel free to contact our support team.</p>
        
        <p>Best regards,<br>The Admin Team</p>
        
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Black Diamond. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

  await sendEmailUser(user.email, emailHtml, emailSubject);
  await NotificationService.sendNotification({
    userId,
    type: "premiumRequest",
    title: "Offer from admin to make premium user.",
    message: "By accepting the premium user offer, you can place orders without making immediate payments. The payment will be billed on a monthly basis."
  });

  return premiumRequest;
};

const paddingPremiumRequest = async (req) => {
  const query = req.query;

  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const searchTerm = query.searchTerm || '';

  try {
    let filterQuery = { premiumRequest: true, customerType: 'REGULAR' };
    if (searchTerm) {
      filterQuery = {
        ...filterQuery,
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { email: { $regex: searchTerm, $options: 'i' } },
        ]
      };
    }

    const users = await User.find(filterQuery)
      .skip(skip)
      .limit(limit)
      .exec();

    const totalCount = await User.countDocuments(filterQuery);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: users,
      meta: {
        page,
        limit,
        totalCount,
        totalPages
      }
    };
  } catch (error) {
    console.error('Error fetching premium requests:', error);
    throw new Error('Error fetching premium request users');
  }
};

const cancelPremiumRequest = async (req) => {
  const { userId } = req.query;

  if (!userId) {
    throw new Error('User ID is required');
  }

  const user = await User.findByIdAndUpdate(
    userId,
    {
      premiumRequest: false,
    }
  );

  return user;

}

const acceptPremiumRequest = async (req) => {
  const { userId } = req.query;

  if (!userId) {
    throw new ApiError(400, "User ID is required.");
  }

  const userDB = await User.findById(userId);
  if (!userDB) {
    throw new ApiError(404, "User not found.");
  }

  if (!userDB.premiumRequest) {
    throw new ApiError(400, "User has not requested premium status.");
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      customerType: "PREMIUM",
      premiumRequest: false,
    },
    { new: true }
  );

  if (!updatedUser) {
    throw new ApiError(500, "Failed to update user to premium.");
  }

  console.log(`User ${userId} was successfully upgraded to PREMIUM.`);

  return {
    message: "User upgraded to PREMIUM successfully.",
    updatedUser,
  };
};

const getIncompleteShippingCost = async (req) => {
  const query = req.query;

  const orderQuery = new QueryBuilder(
    Orders.find({delivery_cost:"Incomplete"})
      .populate({
        path: "user",
      }),
    query
  )
    .search(["email", "status"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await orderQuery.modelQuery;
  const meta = await orderQuery.countTotal();

  return { result, meta };
};

const sendProvideShippingInfoNotification = async (req) => {
  const { orderId } = req.params;
  if (!orderId) {
    throw new ApiError(400, "Order ID is required.");
  }
  const orderDb = await Orders.findById(orderId);
  if (!orderDb) {
    throw new ApiError(404, "User not found.");
  }

  const data = await NotificationService.sendNotification({
    userId: orderDb.user,
    type: ENUM_NOTIFICATION_TYPE.SHIPPING_INFO,
    getId: orderDb._id,
    title: "Incomplete Shipping Information",
    message: "Please provide your shipping details. Once completed, we will charge the shipping fee accordingly.",
  });

  return data;
}

const chargeShippingCost = async (req) => {
  const { orderId, amount} = req.query;
  if (!orderId) {
    throw new ApiError(400, "Order ID is required.");
  }
  const orderDb = await Orders.findById(orderId);
  if (!orderDb) {
    throw new ApiError(404, "User not found.");
  }

  if(!amount){
    throw new ApiError(400, "Amount is required.");
  }

  const result = await Orders.findByIdAndUpdate(
    orderId,
    {
      $set: { deliveryFee: amount }, 
      $inc: { total_amount: amount },  
    },
    { new: true }  
  );
  
  if(!result){
    throw new ApiError(500, "Failed to update order in delivery fee.");
  }

  await NotificationService.sendNotification({
    userId: orderDb.user,
    type: result?.orderType ==="premium"? ENUM_NOTIFICATION_TYPE.NONE: ENUM_NOTIFICATION_TYPE.SHIPPING_PAYMENT,
    getId: orderId,
    title: "Shipping Fee Update for Your Order",
    message: `Dear customer, the shipping fee for your order (ID: ${orderId.slice(-8)}) has been updated to ${amount}. Please pay the shipping fee. Thank you!`,
  });

  return result;
}





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
  getHomePage,
  incomeOverview,
  getUserGrowth,
  getUserList,
  sendPremiumRequest,
  paddingPremiumRequest,
  cancelPremiumRequest,
  acceptPremiumRequest,
  sendProvideShippingInfoNotification,
  chargeShippingCost,
  getIncompleteShippingCost
};

module.exports = { DashboardService };
