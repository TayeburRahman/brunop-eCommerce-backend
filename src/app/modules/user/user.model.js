const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const addressSchema = new Schema({ 
   full_name: {
      type: String,
      required: true,
    },
    contact_no: {
      type: String,
      required: true,
    },
    street_address: {
      type: String,
     required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    }, 
    toZipCode: {
      type: String,
      default: null,
    }, 
    instruction:{
      type: String,
      default: null,
    }
  });

const UserSchema = new Schema(
  {
    authId: {
      type: mongoose.Schema.ObjectId,
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
    profile_image: {
      type: String,
      default: null,
    },
    phone_number: {
      type: String,
      default: null,
    }, 
    address: {
      type: addressSchema,
      default: null,
    }, 
    locations: {
      type: String,
      default: null,
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
    date_of_birth: {
      type: Date,
    },
    amount: {
      type: Number,
      default: 0,
    },
    customerType: {
      type: String,
      enum: ["REGULAR", "PREMIUM"],
      default:'REGULAR',
    },
    premiumRequest:{
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["active", "deactivate"],
      default: "active"
    },
  },
  {
    timestamps: true,
  }
);

const User = model("User", UserSchema);

module.exports = User;
