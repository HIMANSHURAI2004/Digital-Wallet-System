import { Router } from 'express';
import {
    getWallet,
    depositVirtualCash,
    withdrawVirtualCash,
    transferVirtualCash
} from '../controllers/wallet.controller.js';
import { verifyJWT } from '../middlewares/user.middleware.js';


const router = Router();

router.route('/get-wallet').get(verifyJWT, getWallet);
router.route('/deposit').post(verifyJWT, depositVirtualCash);
router.route('/withdraw').post(verifyJWT, withdrawVirtualCash);
router.route('/transfer').post(verifyJWT, transferVirtualCash);


export default router;