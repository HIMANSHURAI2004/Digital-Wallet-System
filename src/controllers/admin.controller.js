import Transaction from "../models/transaction.model.js";
import { User } from "../models/user.model.js";
import { Wallet } from "../models/wallet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getAllUsers = asyncHandler(async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        
        return res
        .status(200)
        .json(
            new ApiResponse(200, users, "All users fetched successfully")
        );

    } catch (error) {
        throw new ApiError(500, "Something went wrong while fetching all users");
    }
})


const getAllTransactions = asyncHandler(async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ createdAt: -1 });
        
        return res
        .status(200)
        .json(
            new ApiResponse(200, transactions, "All transactions fetched successfully")
        );

    } catch (error) {
        throw new ApiError(500, "Something went wrong while fetching all transactions");
    }
})


const getFlaggedTransactions = asyncHandler(async (req, res) => {
    try {
        const transactions = await Transaction.find({ isFlagged: true }).sort({ createdAt: -1 });
        
        return res
        .status(200)
        .json(
            new ApiResponse(200, transactions, "Flagged transactions fetched successfully")
        );

    } catch (error) {
        throw new ApiError(500, "Something went wrong while fetching flagged transactions ");
    }
})

const getTotalUserBalances = asyncHandler(async (req, res) => {
  const wallets = await Wallet.find();

  const total = wallets.reduce(
    (acc, wallet) => {
      acc.USD += wallet.balance.USD || 0;
      acc.INR += wallet.balance.INR || 0;
      acc.EUR += wallet.balance.EUR || 0;
      return acc;
    },
    { USD: 0, INR: 0, EUR: 0 }
  );

  return res
  .status(200)
  .json(
    new ApiResponse(200, total, "Total balances aggregated")
);
});

const getTopUsersByBalance = asyncHandler(async (req, res) => {
  const wallets = await Wallet.aggregate([
    {
      $project: {
        userId: 1,
        totalBalanceUSD: {
          $add: [
            "$balance.USD",
            { $divide: ["$balance.INR", 83] }, // assume 1 USD = 83 INR
            { $divide: ["$balance.EUR", 0.92] } // assume 1 USD = 0.92 EUR
          ]
        }
      }
    },
    { $sort: { totalBalanceUSD: -1 } },
    { $limit: 5}
  ]);

  const results = await Promise.all(wallets.map(async (wallet) => {
    const user = await User.findById(wallet.userId).select("name email");
    return {
      user,
      totalBalanceUSD: wallet.totalBalanceUSD.toFixed(2)
    };
  }));

  return res
  .status(200)
  .json(
    new ApiResponse(200, results, "Top users by total balance")
);
});

const getTopUsersByTransactionVolume = asyncHandler(async (req, res) => {
  const volumes = await Transaction.aggregate([
    {
      $group: {
        _id: "$sender",
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 }
      }
    },
    { $sort: { totalAmount: -1 } },
    { $limit: 5 }
  ]);

  const results = await Promise.all(volumes.map(async (entry) => {
    const user = await User.findById(entry._id).select("name email");
    return {
      user,
      totalTransactionAmount: entry.totalAmount,
      transactionCount: entry.count
    };
  }));

  return res.status(200).json(new ApiResponse(200, results, "Top users by transaction volume"));
});

const softDeleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user){
    throw new ApiError(404, "User not found");
  }  
  user.isDeleted = true;
  user.deletedAt = new Date();
  await user.save();

  return res
  .status(200)
  .json(
    new ApiResponse(200, null, "User soft-deleted")
  );
});

const softDeleteTransaction = asyncHandler(async (req, res) => {
  const { transactionId } = req.params;

  const tx = await Transaction.findById(transactionId);
  if (!tx) throw new ApiError(404, "Transaction not found");

  tx.isDeleted = true;
  tx.deletedAt = new Date();
  await tx.save();

  res.status(200).json(new ApiResponse(200, null, "Transaction soft-deleted"));
});

const getSoftDeletedUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ isDeleted: true }).sort({ deletedAt: -1 });

  return res
  .status(200)
  .json(
    new ApiResponse(200, users, "Soft-deleted users fetched successfully")
);
});

const getSoftDeletedTransactions = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({ isDeleted: true }).sort({ deletedAt: -1 });

  return res
  .status(200)
  .json(
    new ApiResponse(200, transactions, "Soft-deleted transactions fetched successfully")
);
});

export {
    getAllUsers,
    getAllTransactions,
    getFlaggedTransactions,
    getTotalUserBalances,
    getTopUsersByBalance,
    getTopUsersByTransactionVolume,
    softDeleteUser,
    softDeleteTransaction,
    getSoftDeletedUsers,
    getSoftDeletedTransactions
};