import mongoose from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2"

const inventoryLogSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            index: true
        },
        locationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DeliveryHub",
            required: true,
            index: true
        },
        stockMovementType: {
            type: String,
            enum: [
                "GOODS_RECEIPT",            // Stock received from external sources (supplier, production, initial stock)
                "CUSTOMER_ORDER_FULFILLMENT", // Stock dispatched specifically for a customer order
                "STOCK_ADJUSTMENT",         // Manual corrections (e.g., damage, discrepancy from physical count)
                "CUSTOMER_RETURN",          // Stock returned by a customer and re-integrated
                "INTER_HUB_TRANSFER_IN",    // Stock received from another hub or central warehouse
                "INTER_HUB_TRANSFER_OUT"
            ],
            required: true,
            index: true
        },
        quantityChange: {
            type: Number,
            required: true
        },
        newStockLevel: {
            type: Number,
            required: true,
            min: 0
        },
        reason: {
            type:String,
            trim: true
        },
        staffUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order"
        },
        relatedLocationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DeliveryHub",
            sparse: true
        }
    },
    {timestamps:true

    });


inventorySchema.plugin(aggregatePaginate)
const InventoryLog = mongoose.model("InventoryLog", inventoryLogSchema)
export default InventoryLog;