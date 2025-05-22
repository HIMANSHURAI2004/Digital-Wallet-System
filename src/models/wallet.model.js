import mongoose, {Schema} from "mongoose";

const walletSchema = new Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User",
        required: [true, "User ID is required"],
        unique: true,
    },
    balance: { 
        USD : {
            type: Number,
            default: 0,
        },
        INR : {
            type: Number,
            default: 0,
        },
        EUR : {
            type: Number,
            default: 0,
        }
    },
},{timestamps : true});

export const Wallet = mongoose.model("Wallet",walletSchema);