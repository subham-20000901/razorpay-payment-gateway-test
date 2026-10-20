import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    razorpayOrderId:{
        type:String,
        required:true,
        unique:true
    },
    razorpayPaymentId:{
        type:String,
        default:null,
    },
    amount:{
        type:Number,
        required:true,
    },
    currency:{
        type:String,
        default:"INR"
    },
    status:{
        type:String,
        enum:["Pending","Paid","Failed"],
        default:"Pending"
    }
},{timestamps:true});

const Order = mongoose.model("Order",orderSchema);

export default Order;