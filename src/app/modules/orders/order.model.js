const mongoose = require("mongoose");
const { model } = require("mongoose");


const item = new mongoose.Schema({
    product: {
      type: mongoose.Schema.ObjectId, 
      required: true,
      ref: "Product",
    },
    quantity: {
      type: Number,
      required: true,
    },
  });

const ordersSchema = new mongoose.Schema(
  {
    user: {
      type: String,
      required: true,
    },
    
  },
  {
    timestamps: true,
  }
); 
 
const cartsSchema = new mongoose.Schema(
  {
    user: {
        type: String,
        required: true,
    },
    items: {
      type: [item],
      required: true,
    },
    total_amount: {
        type: Number,
        required: true,
      },
  },
  {
    timestamps: true, 
  },
);
 

module.exports = { 
  Carts: model("carts", cartsSchema),
  Orders: model("orders", ordersSchema),
};
