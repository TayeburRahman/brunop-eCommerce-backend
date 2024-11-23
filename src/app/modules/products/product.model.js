const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const ProductSchema = new Schema(
  {
    owner: {
      type: Schema.ObjectId,
      required: true,
      ref: "Auth",
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    }, 
    store: {
      type: Number,
      default: null,
    },
    weight: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },  
    product_image: {
      type: [String],
      default: null,
    }, 
    favorite: {
      type: [String],
      default: [],
    },   
    status: {
      type: String,
      enum: ["Available", "Unavailable", "Out of stock"],
      default: "Available",
    }
  },
  {
    timestamps: true,
  }
);

const Products = model("Product", ProductSchema);

module.exports = Products; 