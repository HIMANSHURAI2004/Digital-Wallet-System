export const DB_NAME = "DigitalWallet"

export const options={
    httpOnly:true,
    secure:true
}

export const fraudConfig = {
    transferWindowMinutes: 1,
    maxTransfersInWindow: 5,
    maxTransferAmount: {
        USD: 5000,
        INR: 200000,
        EUR: 4500
    },
};
