const mongoose = require("mongoose");
const { model } = require("mongoose");

const itemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: "Product",
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  // delivery_fee: {
  //   type: Number,
  //   required: true,
  //   default: 0,  
  // },
});
 

const addressSchema = new mongoose.Schema({ 
  full_name: {
     type: String,
    //  required: true,
   },
   contact_no: {
     type: String,
    //  required: true,
   },
   street_address: {
     type: String,
    // required: true,
   },
   city: {
     type: String,
    //  required: true,
   },
   state: {
     type: String,
    //  required: true,
   }, 
   toZipCode: {
     type: String,
    //  default: null,
   }, 
 });

const ordersSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    orderType: {
      type: String, 
      enum: ['regular', 'premium'],
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    items: {
      type: [itemSchema],
      required: true,
    },
    total_amount: {
      type: Number,
      required: true,
    },
    deliveryFee: {
      type: Number,
      default: 0,
    },
    payment: {
      type: String,
      enum: ["Pending", "Completed"],
      default: "Pending",
    }, 
    transactionId: {
      type: String,
      default: null
    },
    paymentMethod: {
      type: String,
      default: 'card'
    },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipping", "Delivered", "Cancelled"],
      default: "Pending",
    },
    address: {
      type: addressSchema,
      required: true,
    },
    notes: {
      type: String,
      default: null,
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
      type: [itemSchema],
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
