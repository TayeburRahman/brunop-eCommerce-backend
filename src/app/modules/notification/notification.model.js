const { Schema, default: mongoose } = require("mongoose"); 
const { ENUM_NOTIFICATION_TYPE } = require("../../../utils/enums");

const notificationSchema = new Schema(
  {
    getId: {
      type: String,  
    },
    userId: {
      type: Schema.Types.ObjectId, 
      ref: "User",
    }, 
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    }, 
    data:{
      type: Object,
    }, 
    type: {
      type: String,
      enum: ENUM_NOTIFICATION_TYPE,
      required: true,
    },
    seen: {
      type: Boolean,
      default: false,
    }, 
  },
  {
    timestamps: true,
  }
);
const Notification = new mongoose.model("Notification", notificationSchema); 

const feedbackSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,  
      ref: "User",
    }, 
    name: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    }, 
    replayed:{
      type: String,
    },
    reply:  {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
  }
);

const Feedback = new mongoose.model("Feedback", feedbackSchema); 
module.exports = { Feedback, Notification };

