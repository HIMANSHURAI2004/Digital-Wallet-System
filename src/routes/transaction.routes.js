import { Router } from "express";
import { getTransactionHistory } from "../controllers/transaction.controller.js";
import { verifyJWT } from "../middlewares/user.middleware.js";


const router = Router();

router.route("/get-transaction-history").get(verifyJWT, getTransactionHistory);

export default router;