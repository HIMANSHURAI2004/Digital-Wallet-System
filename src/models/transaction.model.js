import mongoose, { Schema } from "mongoose";

const transactionSchema = new Schema({
  type: {
    type: String,
    enum: ["deposit", "withdraw", "transfer"],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: [0, "Amount must be positive"],
  },
  currency: {
    type: String,
    enum: ["USD", "INR", "EUR"],
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null, 
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
  isFlagged: {
  type: Boolean,
  default: false
  },
  fraudReason: {
    type: String,
    default: null
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
  },
}, { timestamps: true });

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
