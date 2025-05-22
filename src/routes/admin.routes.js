import { Router } from "express";
import {
    getAllTransactions,
    getFlaggedTransactions,
    getTotalUserBalances,
    getTopUsersByBalance,
    getTopUsersByTransactionVolume,
    softDeleteUser,
    softDeleteTransaction,
    getSoftDeletedUsers,
    getSoftDeletedTransactions,
    getAllUsers,
} from "../controllers/admin.controller.js";
import {verifyJWT} from "../middlewares/user.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
const router = Router();

router.route("/get-all-users").get(verifyJWT, isAdmin, getAllUsers);
router.route("/get-all-transactions").get(verifyJWT, isAdmin, getAllTransactions);
router.route("/get-flagged-transactions").get(verifyJWT, isAdmin, getFlaggedTransactions);
router.route("/get-total-user-balances").get(verifyJWT, isAdmin, getTotalUserBalances);
router.route("/get-top-users-by-balance").get(verifyJWT, isAdmin, getTopUsersByBalance);
router.route("/get-top-users-by-transactionvolume").get(verifyJWT, isAdmin, getTopUsersByTransactionVolume);
router.route("/soft-delete-user/:userId").post(verifyJWT, isAdmin, softDeleteUser);
router.route("/soft-delete-transaction/:transactionId").post(verifyJWT, isAdmin, softDeleteTransaction);
router.route("/get-soft-deleted-users").get(verifyJWT, isAdmin, getSoftDeletedUsers);
router.route("/get-soft-deleted-transactions").get(verifyJWT, isAdmin, getSoftDeletedTransactions);

export default router;