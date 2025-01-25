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
  product_image: {
    type: String, 
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

 const transitionsSchema = new mongoose.Schema({
  product_payment: {
    type: String, 
    default: null,
  },
  shipping_payment: {
    type: String, 
    default: null,
  }
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
      enum: ['regular', 'premium',],
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
    
    transactionId: {
      type: transitionsSchema,
      default: {}
    },
    paymentMethod: {
      type: String,
      default: 'card'
    }, 
    address: {
      type: addressSchema, 
      default: null,
    },
    shipping_info: {
      type: Boolean,
      default: false,
    },
    deliveryFee: {
      type: Number,
      default: null,
    },
    delivery_cost: {
      type: String,
      enum: ["Incomplete", "Completed"],
      default: 'Incomplete',
    },
    payment: {
      type: String,
      enum: ["Pending", "Product-Payment-Completed", "Incomplete", "All-Payment-Completed"],
      default: "Pending",
    }, 
    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipping", "Delivered", "Cancelled"],
      default: "Pending",
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
