import HubInventory from "../models/hubInventory.model.js";
import ApiError from "../utils/ApiError.js"
import asyncHandler from "../utils/asyncHandler.js"
import Product from "../models/product.model.js"
import DeliveryHub from "../models/deliveryHub.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import InventoryLog from "../models/inventory.model.js";

const initializeHubInventory = asyncHandler( async(req, res) => {
    const {role: authorizedRole}  = req.user;
    if(!["admin", "staff"].includes(authorizedRole)){
        throw new ApiError(403, "Access Forbidden: You do not have the required permissions.")
    }
    const { productId, hubId, initialStockLevel , reservedStockLevel = 0, reorderPoint = 0, lastRestockRequestDate} = req.body;
    let inventoryObejct = {};
    
    if(!productId || !hubId || initialStockLevel === undefined || initialStockLevel === null ){
        throw new ApiError(400, "Product ID,  Hub ID, & initial stock level are required.")
    }

    if(typeof initialStockLevel !== "number" || initialStockLevel < 0){
        throw new ApiError(400, "Initial stock level must not be below 0. ")
    }
    if(typeof reservedStockLevel !== "number" || reservedStockLevel < 0){
        throw new ApiError(400, "Reserved stock level must not be below 0. ")
    }
    if(typeof reorderPoint !== "number" || reorderPoint < 0){
        throw new ApiError(400, "Reorder Point must not be below 0. ")
    }
    const checkProductExist = await Product.findById(productId)
    if(!checkProductExist){
        throw new ApiError(404, "product not found! check provided product Id. ")
    }
    const checkHubExist = await DeliveryHub.findById(hubId)
    if(!checkHubExist){
        throw new ApiError(404, "hub not found! check provide hub Id. ")
    }

    const existingHubInventory = await HubInventory.findOne({productId, hubId})
    if(existingHubInventory){
        throw new ApiError(409, "Inventory Log already exist for this product at this Hub, Use adjust product to update it. ")
    }   

    const newHubInventory = await HubInventory.create(
        {
            productId,
            hubId,
            currentStockLevel: initialStockLevel,
            reservedStockLevel,
            reorderPoint
        })
    
    if(!newHubInventory){
        throw new ApiError(500, "Internal error: Failed to create initial hub inventory record. ")
    }
    const newInventoryLog = await InventoryLog.create({
        productId: newHubInventory.productId,
        locationId: newHubInventory.hubId,
        stockMovementType: "GOODS_RECEIPT",
        quantityChange: newHubInventory.currentStockLevel,
        newStockLevel: newHubInventory.currentStockLevel,
        staffUserId: req.user._id,
        reason: "Initial inventory setup for new product/hub combination."
    });

    return res.json(
        new ApiResponse(201, newHubInventory, "Initial hub inventory created successfully.")
    )
})

const adjustHubStock = asyncHandler( async( req, res) => {
    const {role: authorizedRole} = req.user;
    if(!["admin", "staff"].includes(authorizedRole)){
        throw new ApiError(403, "Access Forbidden: You do not have the required permissions.")
    }

    const { productId, hubId, quantityChange, stockMovementType, reason } = req.body;

    if (!productId || !hubId || quantityChange === undefined || quantityChange === null || !stockMovementType) {
        throw new ApiError(400, "Product ID, Hub ID, quantity change, and stock movement type are required.");
    }
    if (typeof quantityChange !== 'number' || quantityChange === 0) {
        throw new ApiError(400, "Quantity change must be a non-zero number.");
    }
    
    const hubInventoryEntry = await HubInventory.findOne({ productId, hubId });
    if(!hubInventoryEntry){
        throw new ApiError(404,"Inventory record not found for this product at this hub. Please initialize it first.")
    }

    const newCurrentStockLevel = hubInventoryEntry.currentStockLevel + quantityChange;
    if (newCurrentStockLevel < 0) {
        throw new ApiError(400, `Insufficient stock: Cannot decrease stock by ${Math.abs(quantityChange)}. Current stock is ${hubInventoryEntry.currentStockLevel}.`);
    }

    const updatedHubInventory = await HubInventory.findByIdAndUpdate(
        hubInventoryEntry._id,
        {$inc: {currentStockLevel: quantityChange}},
        {new: true, runValidators: true}
    )

    if (!updatedHubInventory) {
        throw new ApiError(500, "Internal Server Error: Failed to update hub inventory stock.");
    }

    const updatedInventoryLogGenerated = await InventoryLog.create({
        productId: updatedHubInventory.productId,
        locationId: updatedHubInventory.hubId,
        stockMovementType: stockMovementType, 
        quantityChange: quantityChange,
        newStockLevel: updatedHubInventory.currentStockLevel, 
        staffUserId: req.user._id, 
        reason: reason || `Stock adjusted by ${quantityChange}` 
    });

    return res.json(
        new ApiResponse(202,updatedHubInventory, "product status updated in hub Inventory. ")
    )
})


export {
    initializeHubInventory,
    adjustHubStock
}