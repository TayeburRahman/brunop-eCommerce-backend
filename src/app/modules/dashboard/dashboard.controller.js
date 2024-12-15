const catchAsync = require("../../../shared/catchasync");
const sendResponse = require("../../../shared/sendResponse");
const { DashboardService } = require("../dashboard/dashboard.service");

const getAllUsers = catchAsync(async (req, res) => {
  const result = await DashboardService.getAllUsers(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Users retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getAuthDetails = catchAsync(async (req, res) => {
  const result = await DashboardService.getAuthDetails(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User details retrieved successfully",
    data: result,
  });
});

const blockUnblockAuthProfile = catchAsync(async (req, res) => {
  const result = await DashboardService.blockUnblockAuthProfile(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Blocked successfully",
    data: result,
  });
});

const getAllManager= catchAsync(async (req, res) => {
  const result = await DashboardService.getAllManager();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Manager retrieval successful",
    data: result,
  });
}); 

const getAllPendingManager = catchAsync(async (req, res) => {
  const result = await DashboardService.getAllPendingManager(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Pending partners retrieved Successfully",
    data: result,
  });
});
  
const getAllAdmins = catchAsync(async (req, res) => {
  const result = await DashboardService.getAllAdmins(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "All admin retrieval successful",
    data: result,
  });
});

const getAdminDetails = catchAsync(async (req, res) => {
  const result = await DashboardService.getAdminDetails(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Admin details retrieved successfully",
    data: result,
  });
});
  
const deleteProfile = catchAsync(async (req, res) => { 
  const result = await DashboardService.deleteProfile(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Delete profile successfully",
    data: result,
  });
});

const addTermsConditions = catchAsync(async (req, res) => {
  const result = await DashboardService.addTermsConditions(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message ? result.message : "Successful",
    data: result.result ? result.result : result,
  });
});

const getTermsConditions = catchAsync(async (req, res) => {
  const result = await DashboardService.getTermsConditions();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Successful",
    data: result,
  });
});

const deleteTermsConditions = catchAsync(async (req, res) => {
  const result = await DashboardService.deleteTermsConditions(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Deletion Successful",
    data: result,
  });
});

const addPrivacyPolicy = catchAsync(async (req, res) => {
  const result = await DashboardService.addPrivacyPolicy(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message ? result.message : "Successful",
    data: result.result ? result.result : result,
  });
});

const getPrivacyPolicy = catchAsync(async (req, res) => {
  const result = await DashboardService.getPrivacyPolicy();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Successful",
    data: result,
  });
});

const deletePrivacyPolicy = catchAsync(async (req, res) => {
  const result = await DashboardService.deletePrivacyPolicy(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Deletion Successful",
    data: result,
  });
});

const addFaq = catchAsync(async (req, res) => {
  const result = await DashboardService.addFaq(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Successfully added Faq",
    data:  result,
  });
});

const getFaq = catchAsync(async (req, res) => {
  const result = await DashboardService.getFaq();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Successfully Gets Faq",
    data:result,
  });
});

const deleteFaq = catchAsync(async (req, res) => {
  const result = await DashboardService.deleteFaq(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message:"Successfully delete!",
    data:  result,
  });
});

const updateFaq = catchAsync(async (req, res ) => {
  const result = await DashboardService.updateFaq(req); 
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Successfully Update!',
    data: result,
  });
});

const getHomePage = catchAsync(async (req, res ) => {
  const result = await DashboardService.getHomePage(req); 
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Successfully!',
    data: result,
  });
});
 
const incomeOverview = catchAsync(async (req, res ) => {
  const result = await DashboardService.incomeOverview(req.query); 
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Successfully!',
    data: result,
  });
});

const getUserGrowth = catchAsync(async (req, res ) => {
  const result = await DashboardService.getUserGrowth(req.query); 
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Successfully!',
    data: result,
  });
});
 
const getUserList = catchAsync(async (req, res ) => {
  const result = await DashboardService.getUserList(req); 
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Successfully!',
    data: result,
  });
});

const sendPremiumRequest = catchAsync(async (req, res ) => {
  const result = await DashboardService.sendPremiumRequest(req); 
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Successfully!',
    data: result,
  });
});

const paddingPremiumRequest = catchAsync(async (req, res ) => {
  const result = await DashboardService.paddingPremiumRequest(req); 
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Successfully!',
    data: result,
  });
});

const cancelPremiumRequest = catchAsync(async (req, res ) => {
  const result = await DashboardService.cancelPremiumRequest(req); 
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Request Cancel Successfully!',
    data: result,
  });
});

 
 

const DashboardController = {
  getAllUsers,
  getAuthDetails,
  deleteProfile,
  blockUnblockAuthProfile,
  getAllManager, 
  getAllAdmins,
  getAdminDetails, 
  getAllPendingManager, 
  addPrivacyPolicy,
  getPrivacyPolicy,
  deletePrivacyPolicy,
  addTermsConditions,
  getTermsConditions,
  deleteTermsConditions,
  addFaq,
  deleteFaq,
  getFaq,
  updateFaq,
  getHomePage,
  incomeOverview,
  getUserGrowth,
  getUserList,
  sendPremiumRequest,
  paddingPremiumRequest,
  cancelPremiumRequest
};

module.exports = { DashboardController };
