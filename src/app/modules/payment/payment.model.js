const mongoose = require("mongoose");
const { Schema } = mongoose;

const transactionSchema = new Schema(
  {
    orderId: [
      {
        type: Schema.Types.ObjectId,
        ref: "Orders",
        required: true,
      },
    ],
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Completed", "Pending", "Failed", "Refunded"],
      required: true,
    },
    transaction_id: {
      type: String,
      required: true,
    },
    paymentType: {
      type: String,
      enum: ["Shipping Cost", "Products Cost", "Premium Payment"],
      required: true,
    },
  },
  { timestamps: true }
);
 
transactionSchema.index({ createdAt: 1 });
transactionSchema.index({ paymentStatus: 1 });

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = { Transaction };
