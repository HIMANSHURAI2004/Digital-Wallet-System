import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
const app = express();

dotenv.config()

app.use(cors({
    origin: process.env.CORS_ORIGIN, // Frontend URL
    credentials: true,
    optionsSuccessStatus: 200,
}))

app.use(express.json({ limit:"5mb" }));
app.use(express.urlencoded({extended :true,limit : "5mb"}));
app.use(express.static("public"));
app.use(cookieParser());

import walletRouter  from "./routes/wallet.routes.js";
import userRouter from './routes/user.routes.js';
import transactionRouter from './routes/transaction.routes.js';
import adminRouter from './routes/admin.routes.js';

app.use("/api/v1/user",userRouter);
app.use("/api/v1/wallet", walletRouter);
app.use("/api/v1/transaction", transactionRouter);
app.use("/api/v1/admin", adminRouter);


export {app}