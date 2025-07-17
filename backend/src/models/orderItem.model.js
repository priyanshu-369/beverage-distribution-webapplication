import mongoose, { mongo } from "mongoose";

const orderItemSchema = new mongoose.Schema(
    {
        orderId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Order', 
            required: true 
        },
        productId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Product', 
            required: true 
        },
        quantity: { 
            type: Number, 
            required: true, 
            min: 1 
        },
        unitPriceAtOrder: { 
            type: Number, 
            required: true, 
            min: 0 
        },
        subtotal: { 
            type: Number, 
            required: true, min: 0 
        },
        productName: { //product name
            type: String, 
            required: true 
        }, 
        productSku: {  // Store SKU at time of order
            type: String, 
            required: true 
        },  
        productWeightAtTimeOfOrder: {
             type: Number, 
             min: 0, 
             default: 0 
        }, 
        productVolumeAtTimeOfOrder: { 
            type: Number, 
            min: 0, 
            default: 0 
        }, 
});

const OrderItem = mongoose.model("OrderItem",orderItemSchema);
export default OrderItem;