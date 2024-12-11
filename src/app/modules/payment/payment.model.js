const mongoose = require('mongoose');
const { Schema } = mongoose;
const { ObjectId } = Schema.Types;


const transactionSchema = new Schema({
    orderId: {
        type: ObjectId,
        ref: "Service",
        required: true,
    },
    userId: {
        type: ObjectId,
        ref: "User",
        required: true,
    }, 
    amount: {
        type: Number,
        required: true,
    }, 
    paymentStatus: {
        type: String,
        enum: ["Completed", "Pending", "Failed","Refunded"],
        required: true,
    },
    paymentDetails: {
        email: {
            type: String, 
        },
        transaction_id: {
            type: String,
            required: true,
        },
        currency: {
            type: String,
            default: "USD",
        },
        paymentMethod: {
            type: String,
            enum: ["Stripe", "PayPal", "ApplePay", "GooglePay"],
            required: true,
        },
    },
}, { timestamps: true });



const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = { Transaction };
