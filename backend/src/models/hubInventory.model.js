import mongoose from "mongoose";

const hubInventorySchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            index: true
        },
        hubId: { //  delivery hub se refrence karega
            type: mongoose.Schema.Types.ObjectId,
            ref: "DeliveryHub",
            required: true,
            index: true
        },
        currentStockLevel: { // Actual quantity of the product currently physically present at the hub
            type: Number,
            required: true,
            default: 0,
            min: 0
        },
        reservedStockLevel: { // Quantity of the product reserved for pending orders
            type: Number,
            required: true,
            default: 0,
            min: 0
        },
        reorderPoint : {
            type: Number,
            default: 0,
            min:0
        },
        lastRestockRequestDate: {
            type: Date
        }

        // You might add fields like `lastInventoryUpdate` for auditing, though timestamps handle this too.
        // Or `reorderPoint`, `maxStockLevel` for inventory management logic.
    },
    { timestamps: true }
);

// Add a compound unique index to ensure only one entry per product per hub
hubInventorySchema.index({ productId: 1, hubId: 1 }, { unique: true });

const HubInventory = mongoose.model("HubInventory", hubInventorySchema);
export default HubInventory;