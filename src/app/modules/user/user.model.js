const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const addressSchema = new Schema({ 
    name: {
      type: String,
      default: null,
    },
    contact_no: {
      type: String,
      default: null,
    },
    delivery_address: {
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
    location: {
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
