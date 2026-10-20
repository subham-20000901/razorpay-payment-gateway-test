import express from "express";
import { createOrder, getOrderStatus, handlePaymentFailure, verifyPayment } from "../controller/paymentController.js";

const paymentRouter = express.Router();

paymentRouter.post("/create-order",createOrder);
paymentRouter.post("/verify",verifyPayment);
paymentRouter.post("/failed",handlePaymentFailure);
paymentRouter.get("/:orderId",getOrderStatus);

export default paymentRouter;