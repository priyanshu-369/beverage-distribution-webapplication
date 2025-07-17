import mongoose, { mongo } from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        deliveryAddressId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Address",
            required: true
        },
        orderTimestamp: {
            type: Date,
            default: Date.now
        },
        scheduledDeliveryDate: {
            type: Date,
            required: true
        },
        scheduledDeliverySlot: {
            type: String,
            enum: ["MORNING (9:00 AM - 12:00 PM)", "AFTERNOON (2:00 PM - 8:00 PM)"],
            default: "AFTERNOON (2:00 PM - 8:00 PM)",
            required: true
        },
        totalAmount: {
            type: Number,
            required: true
        },
        deliveryFee: {
            type: Number,
            required: true
        },
        paymentMethod: { // Now streamlined to Razorpay
            type: String,
            enum: ["Razorpay"],
            default: "Razorpay",
            required: true,
        },
        razorpayOrderId: { // Razorpay ka order ID
            type: String,
            trim: true,
            unique: true
        },
        razorpayPaymentId: { // razorpay id agar payment sucessful huwa
            type: String,
            trim: true,
            unique: true,
            sparse: true
        },
        razorpaySignature: { // Razorpay ka signature  verification ke liye
            type: String,
            trim: true,
            sparse: true
        },
        orderStatus: {
            type: String,
            enum: ["pending assignment", "assigned to batch (first mile)", "arrived at hub", "pending last-mile assignment", "assigned last-mile", "picked up (from hub)", "on the way", "delivered", "cancelled", "refunded"],
            default: "pending assignment",
            required: true
        },
        deliveryBatchId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DeliveryBatch",
            index:true
        },
        assignedDeliveryPartner: {
            type: mongoose.Schema.Types.ObjectId,
            ref:"DeliveryPartner",
            index: true
        },
        totalOrderWeight: {
            type: Number,
            min: 0,
            default: 0
        },
        totalOrderVolume: {
            type: Number,
            min: 0,
            default: 0
        },
        cancellationReason: { // Reason for order cancellation ye must hai agar order cancle huwa toh
            type: String,
            trim: true
        },
        actualDeliveryTimestamp: { 
            type: Date 
        },
        invoiceUrl: {
             type: String 
        },
        identifiedDeliveryZoneId: { 
            type: 'ObjectId', 
            ref: 'Zone' 
        },
        promotionCodeApplied: { 
            type: String, 
            ref: 'Promotion' 
        },
        customerNotes: { 
            type: String 
        }
    },
    {timestamps: true});


const Order = mongoose.model("Order", orderSchema);
export default Order;