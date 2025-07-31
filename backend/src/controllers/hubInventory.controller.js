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
    
    if(productId || hubId || initialStockLevel === undefined || initialStockLevel === null ){
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
    if(!newHubInventory){
        throw new ApiError(500, ":Internal error: Failed to create inventory log. ")
    }

    return res.json(
        new ApiResponse(201, newHubInventory, "Initial hub inventory created successfully.")
    )
})



export {
    initializeHubInventory,
}