import Transaction from '../models/transaction.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const getTransactionHistory = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id;
    
        const transactions = await Transaction.find({
            $or: [
                { sender: userId },
                { receiver: userId }
            ],
            isDeleted: false
        }).sort({ createdAt: -1 });
    
        return res
        .status(200)
        .json(
            new ApiResponse(200, transactions, "Transaction history fetched successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Something went wrong while fetching transaction history");
    }
})


export {
    getTransactionHistory
}