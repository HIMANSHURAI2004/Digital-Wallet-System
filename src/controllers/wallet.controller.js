import  Transaction from "../models/transaction.model.js";
import { Wallet } from "../models/wallet.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { fraudConfig } from "../constants.js";


const getWallet = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
        throw new ApiError(404, "Wallet not found");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, wallet, "Wallet fetched successfully")
    );
})

const depositVirtualCash = asyncHandler(async (req, res) => {
    try {
        const { amount, currency } = req.body;
        const userId = req.user.id;
    
        if (!amount || !currency) {
            throw new ApiError(400, "Amount and currency are required");
        }
    
        const wallet = await Wallet.findOne({ userId });
        if (!wallet) {
            throw new ApiError(404, "Wallet not found");
        }
    
        wallet.balance[currency] += amount;
        await wallet.save();
        
        await Transaction.create({
            type: "deposit",
            amount,
            currency,
            receiver: userId,
            status: "completed",
        });


        return res
            .status(200)
            .json(
                new ApiResponse(200, wallet, "Virtual cash deposited successfully")
            );
    } catch (error) {
        throw new ApiError(500, "Something went wrong while depositing virtual cash");
    }
})

const withdrawVirtualCash = asyncHandler(async (req, res) => {
    try {
        const { amount, currency } = req.body;
        const userId = req.user.id;
    
        if (!amount || !currency) {
            throw new ApiError(400, "Amount and currency are required");
        }
    
        const wallet = await Wallet.findOne({ userId });
        if (!wallet) {
            throw new ApiError(404, "Wallet not found");
        }
    
        if (wallet.balance[currency] < amount) {
            throw new ApiError(400, "Insufficient balance");
        }

        let isFlagged = false;
        let fraudReason = null;

        const withdrawalThreshold = fraudConfig.maxTransferAmount;

        if (amount > (withdrawalThreshold[currency])) {
            isFlagged = true;
            fraudReason = "Sudden large withdrawal detected";
        }

        wallet.balance[currency] -= amount;
        await wallet.save();
        
        await Transaction.create({
            type: "withdraw",
            amount,
            currency,
            sender: userId,
            status: "completed",
            isFlagged,
            fraudReason
        });

        return res.status(200).json(
            new ApiResponse(
                200, 
                wallet, 
                isFlagged 
                    ? "Withdrawal processed with suspicious activity flagged"
                    : "Virtual cash withdrawn successfully"
            )
        );
    } catch (error) {
        throw new ApiError(500, error.message || "Something went wrong during withdrawal");
    }
});


const transferVirtualCash = asyncHandler(async (req, res) => {
    try {
        const { amount, currency, receiverEmail } = req.body;
        const senderId = req.user.id;

        if (!amount || !currency || !receiverEmail) {
            throw new ApiError(400, "Amount, currency, and receiver email are required");
        }

        const senderWallet = await Wallet.findOne({ userId: senderId });
        if (!senderWallet) {
            throw new ApiError(404, "Sender wallet not found");
        }

        if (senderWallet.balance[currency] < amount) {
            throw new ApiError(400, "Insufficient balance");
        }

        const receiver = await User.findOne({ email: receiverEmail });
        if (!receiver) {
            throw new ApiError(404, "Receiver not found");
        }

        if (receiver.isDeleted) {
            throw new Error("User not found or has been soft-deleted");
        }


        const receiverWallet = await Wallet.findOne({ userId: receiver._id });
        if (!receiverWallet) {
            throw new ApiError(404, "Receiver wallet not found");
        }

        let isFlagged = false;
        let fraudReason = null;

        const nMinuteAgo = new Date(Date.now() - fraudConfig.transferWindowMinutes * 1000);
        const recentTransfers = await Transaction.countDocuments({
            sender: senderId,
            type: "transfer",
            createdAt: { $gte: nMinuteAgo },
        });

        if (recentTransfers >= fraudConfig.maxTransfersInWindow) {
            isFlagged = true;
            fraudReason = "Multiple transfers in a short period";
        }

        senderWallet.balance[currency] -= amount;
        await senderWallet.save();

        receiverWallet.balance[currency] += amount;
        await receiverWallet.save();

        await Transaction.create({
            type: "transfer",
            amount,
            currency,
            sender: senderId,
            receiver: receiver._id,
            status: "completed",
            isFlagged,
            fraudReason,
        });

        return res.status(200).json(
            new ApiResponse(200, { senderWallet, receiverWallet }, 
            isFlagged 
                ? "Virtual cash transferred with suspicious activity flagged" 
                : "Virtual cash transferred successfully")
        );

    } catch (error) {
        throw new ApiError(500, error.message || "Something went wrong");
    }
});


export {
    getWallet,
    depositVirtualCash,
    withdrawVirtualCash,
    transferVirtualCash
}