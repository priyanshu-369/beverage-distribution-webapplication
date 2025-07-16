import mongoose from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2"

const inventorySchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            index: true
        },
        changeType: {
            type: String,
            enum: ["inbound", "outbound", "adjustment", "return"], /*
         `Inbound`: Stock received (e.g., from a supplier, new production).
         `Outbound`: Stock dispatched (e.g., sold to a customer, consumed in production).
         `Adjustment`: Manual correction to stock levels (e.g., after a physical count, correcting errors).
         `Return`: Stock returned to inventory (e.g., customer return, supplier return).*/
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
        }
    },
    {timestamps:true

    });


inventorySchema.plugin(aggregatePaginate)
const InventoryLog = mongoose.model("InventoryLog", inventorySchema)
export default InventoryLog;