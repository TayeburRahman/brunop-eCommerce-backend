const QueryBuilder = require("../../../builder/queryBuilder");
const ApiError = require("../../../errors/ApiError");
const { ENUM_SOCKET_EVENT, ENUM_USER_ROLE } = require("../../../utils/enums");
const { sendEmailUser } = require("../../../utils/sendEmailUser");
const { Notification, Feedback } = require("./notification.model");


const handleNotification = async (receiverId, role, socket, io) => {

  // get all notifications 
  socket.on(ENUM_SOCKET_EVENT.NOTIFICATION, async (data) => {
    console.log("get all notification:", role, receiverId);

    const filter = role === ENUM_USER_ROLE.USER
      ? { userId: receiverId }
      : role === ENUM_USER_ROLE.DRIVER
        ? { driverId: receiverId }
        : null;

    console.log("filter:", filter)

    if (filter) {
      const notifications = await Notification.find(filter);
      console.log(notifications)

      io.to(receiverId).emit(ENUM_SOCKET_EVENT.NOTIFICATION, notifications);
    } else {
      console.error("Invalid role provided:", role);
    }
  });

  // update seen notifications 
  socket.on(ENUM_SOCKET_EVENT.SEEN_NOTIFICATION, async (data) => {
    console.log("seen notification:", role, receiverId);
    const filter = role === ENUM_USER_ROLE.USER
      ? { userId: receiverId }
      : role === ENUM_USER_ROLE.DRIVER
        ? { driverId: receiverId }
        : null;

    if (filter) {
      await Notification.updateMany(filter, { $set: { seen: true } });
      const notifications = await Notification.find(filter);

      io.to(receiverId).emit(ENUM_SOCKET_EVENT.NOTIFICATION, notifications);
    } else {
      console.error("Invalid role provided:", role);
    }
  });
};

// Send notification function
const sendNotification = async ({ title, message, getId, data, userId, type }) => {
  try {
    const notification = await Notification.create({
      title,
      userId,
      message,
      getId,
      data,
      type
    });

    return notification;
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

const getUserNotifications = async (req) => {
  const { userId } = req.user;
  const query = req.query; 

  if (!userId) {
    throw new ApiError(400, "User ID is required.");
  }
 
  const notifications = new QueryBuilder( Notification.find({ userId }),query  )
  .search()
  .filter()
  .paginate()
  .sort({ createdAt: -1 })
  .fields() 
 
  const result = await notifications.modelQuery;
  const meta = await notifications.countTotal(); 
 
  return { result, meta };
};


const emitNotification = (receiver, notification) => {
  if (global.io) {
    const socketIo = global.io;
    socketIo.to(receiver.toString()).emit(ENUM_SOCKET_EVENT.NEW_NOTIFICATION, notification);
  } else {
    console.error('Socket.IO is not initialized');
  }
};

const createFeedBacks = async (req) => {
  const { userId } = req.user;
  const { name, message } = req.body;
  if (!name || !message) {
    throw new ApiError(400, "Name and message are required.");
  }
  const feedback = new Feedback({ userId, name, message });
  return await feedback.save();
}

const replayFeedback = async (req) => {
  const { feedbackId, replyMessage } = req.body;

  // Validate reply message
  if (!replyMessage) {
    throw new ApiError(400, 'Reply message is required.');
  }

  // Fetch feedback by ID
  const feedback = await Feedback.findById(feedbackId).populate("userId");
  if (!feedback) {
    throw new ApiError(404, 'Feedback not found.');
  }

  // Send notification to the user
  await sendNotification({
    userId: feedback.userId,
    type: "notice",
    title: "Reply to Your Feedback",
    message: replyMessage,
  });

  // Prepare and send an email response
  const emailSubject = "Reply to Your Feedback";

  const emailHtml = `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Feedback Reply</title>
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
          <h1>Hello, ${feedback.name}</h1>
          <p>Thank you for providing us with your feedback. We have reviewed your message and have responded with the following:</p>
          <p><strong>Your Message:</strong> "${feedback.message}"</p>
          <p><strong>Our Reply:</strong> "${replyMessage}"</p>

          <p>If you have any further questions or need assistance, feel free to reach out to our support team.</p>
          
          <p>Best regards,<br>The Support Team</p>
          
          <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Black Diamond. All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>
  `;

  await sendEmailUser(feedback.userId.email, emailHtml, emailSubject);

  // Update feedback with reply details
  feedback.replayed = replyMessage;
  feedback.reply = true;

  return await feedback.save();
};

const allFeedback = async (req) => {
  const result = await Feedback.find()
  return result
}

const deleteFeedback = async (req) => {
  const id = req.query.id; 
  if (!id) {
    throw new ApiError(400, "Feedback ID is required.");
  }
 
  const result = await Feedback.findByIdAndDelete(id);
 
  if (!result) {
    throw new ApiError(404, "Feedback not found.");
  }
  return {
    message: "Feedback deleted successfully.",
    feedback: result,
  };
};



const NotificationService = { 
  handleNotification, 
  sendNotification, 
  emitNotification, 
  createFeedBacks, 
  replayFeedback, 
  allFeedback,
  getUserNotifications,
  deleteFeedback
};

module.exports = { NotificationService}


