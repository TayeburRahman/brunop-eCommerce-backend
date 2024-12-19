const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const ManagerSchema = new Schema(
  {
    authId: {
      type: Schema.ObjectId,
      required: true,
      ref: "Auth",
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    }, 
    city: {
      type: String,
      default: null,
    },
    state: {
      type: String,
      default: null,
    },
    country: {
      type: String,
      default: null,
    }, 
    phone_number: {
      type: String,
      default: null,
    },
    address: {
      type: String,
      default: null,
    },
    locations: {
      type: String,
      default: null,
    },
    date_of_birth: {
      type: String,
      default: null,
    },
    isPhoneNumberVerified: {
      type: Boolean,
      default: false,
    },
    profile_image: {
      type: String,
      default: null,
    }, 
    
    paypalEmail: {
      type: String,
    },
    rating: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["pending", "approved"],
      default: "pending",
    },  
  },
  {
    timestamps: true,
  }
);

const Manager = model("Manager", ManagerSchema);

module.exports = Manager; 
