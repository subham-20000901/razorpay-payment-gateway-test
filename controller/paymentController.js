import dotenv from "dotenv";
import Order from "../model/orderModel.js";
import Razorpay from "razorpay";
import crypto from "crypto";
dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createOrder = async (req, res) => {
  try {
    const amount = Number(req.body.amount);

    if (!Number.isSafeInteger(amount) || amount < 1 || amount > 10000) {
      return res.status(400).json({
        success: false,
        message: "Invalid Amount",
      });
    }

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
    });

    await Order.create({
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
      status: "Pending",
    });

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    if (
      payment.order_id !== razorpay_order_id ||
      payment.status !== "captured"
    ) {
      return res.status(400).json({ message: "Payment not completed" });
    }

    const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });

    if (!order) {
      return res.status(400).json({ message: "Order not completed" });
    }

    if (payment.amount !== order.amount) {
      return res.status(400).json({
        success: false,
        message: "Amount mismatch",
      });
    }

    order.razorpayPaymentId = razorpay_payment_id;
    order.status = "Paid";
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const handlePaymentFailure = async (req, res) => {
  try {
    const order = await Order.findOne({ razorpayOrderId: req.body.orderId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.status === "Pending") {
      order.status = "Failed";
      await order.save();
    }

    return res.status(200).json({
      success: true,
      message: "Payment Status Updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getOrderStatus = async (req, res) => {
  try {
    const order = await Order.findOne({ razorpayOrderId: req.params.orderId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
