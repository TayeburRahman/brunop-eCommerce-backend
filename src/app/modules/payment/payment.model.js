const mongoose = require('mongoose');
const { Schema } = mongoose;
const { ObjectId } = Schema.Types;


const transactionSchema = new Schema({
    orderId: [{
        type: ObjectId,
        ref: "Order",
        required: true,
    }], 
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
    transaction_id: {
        type: String,
        required: true,
    }
}, { timestamps: true });



const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = { Transaction };
