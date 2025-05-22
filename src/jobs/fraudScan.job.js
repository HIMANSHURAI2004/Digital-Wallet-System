import cron from "node-cron";
import Transaction from "../models/transaction.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { fraudConfig } from "../constants.js";

export const runDailyFraudScan = () => {
  cron.schedule("0 0 * * *", asyncHandler(async () => {
    console.log(" Running scheduled daily fraud scan");

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentTransactions = await Transaction.find({ createdAt: { $gte: oneDayAgo } });

    const userMap = {};
    let flaggedCount = 0;

    for (const tx of recentTransactions) {
      const key = tx.sender?.toString();
      if (!key) continue;

      if (!userMap[key]) {
        userMap[key] = [];
      }
      userMap[key].push(tx);
    }

    for (const userId in userMap) {
      const userTxs = userMap[userId].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      for (let i = 1; i < userTxs.length; i++) {
        const prev = new Date(userTxs[i - 1].createdAt);
        const curr = new Date(userTxs[i].createdAt);
        const diffMinutes = (curr - prev) / (1000 * 60);

        if (
          userTxs[i].type === "transfer" &&
          diffMinutes <= fraudConfig.transferWindowMinutes
        ) {
          userTxs[i].isFlagged = true;
          userTxs[i].fraudReason = "Multiple transfers in short time (daily scan)";
          await userTxs[i].save();
          flaggedCount++;
        }
      }

      for (const tx of userTxs) {
        if (tx.type === "withdraw") {
          const threshold = fraudConfig.largeWithdrawalThreshold?.[tx.currency];
          if (threshold && tx.amount > threshold) {
            tx.isFlagged = true;
            tx.fraudReason = `Large withdrawal detected in ${tx.currency} (daily scan)`;
            await tx.save();
            flaggedCount++;
          }
        }
      }
    }

    console.log(`Daily Fraud Summary:
        - Total scanned users: ${Object.keys(userMap).length}
        - Flagged transactions today: ${flaggedCount}
    `);
  }));
};
