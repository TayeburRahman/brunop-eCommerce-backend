const catchAsync = require("../../../shared/catchasync");
const sendResponse = require("../../../shared/sendResponse"); 
const { NotificationService } = require("./notification.service");

const getAllNotification = catchAsync(async (req, res) => {
  // const result = await notificationService.getAllNotificationFromDB(req?.user);
  // sendResponse(res, {
  //   statusCode: 200,
  //   success: true,
  //   message: "Notification retrieved successfully",
  //   data: result,
  // });
});

const createFeedBacks = catchAsync(async (req, res) => {
  const result = await NotificationService.createFeedBacks(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Create feedbacks successfully",
    data: result,
  });
});

const replayFeedback = catchAsync(async (req, res) => {
  const result = await NotificationService.replayFeedback(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Feedbacks replay successfully",
    data: result,
  });
});

const allFeedback = catchAsync(async (req, res) => {
  const result = await NotificationService.allFeedback(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Feedbacks get successfully",
    data: result,
  });
});
 

 

const NotificationController = {
  getAllNotification,
  createFeedBacks,
  replayFeedback,
  allFeedback
};

module.exports = { NotificationController };
