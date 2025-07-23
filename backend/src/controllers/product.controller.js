import Product from "../models/product.model.js"
import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"



// way to register product only using category === machine
// second way tp register product only using category === beverage
// if not found any on error

const createNewProduct = asyncHandler( async(req, res) => {
    const { category, 
        name, 
        description, 
        sku, 
        productCode, 
        basePrice, 
        subCategory, 
        brand, 
        volume,
        volumeUnit,
        weight,
        weightUnit,
        packagingType,
        capacity,
        powerConsumption,
        supplierId,
        isAvailable
        } = req.body;
    
    if(!category || category === ""){
        throw new ApiError(400, "category undefined")
    }

    if(category === "machine"){
        if([name, description, sku, productCode, basePrice, subCategory, brand, weight, capacity, powerConsumption, supplierId, isAvailable].some((field) => field?.trim() === "")){
            throw new ApiError(401,"some feilds are missing.")
        }

        const productInsertedStatus = await Product.create({
            name,
            description,
            sku, 
            productCode,
            basePrice,
            category,
            subCategory,
            brand,
            weight,
            capacity,
            powerConsumption,
            isAvailable,
            supplierId
        })

        if(productInsertedStatus){
            return res.json(
                new ApiResponse(201, productInsertedStatus, "product added successfully")
            )
        }else{
            return res.jsno(
                new ApiError(500, "some internal server error occured.")
            )
        }
    }

    if(category === "beverage"){
       if([name, description, sku, productCode, basePrice, subCategory, brand, weight, capacity, powerConsumption, supplierId, isAvailable].some().trim() === ""){
            throw new ApiError(401,"some feilds are missing.")
        }

        const productInsertedStatus = await Product.create({
            name,
            description,
            sku,
            productCode,
            basePrice,
            category,
            subCategory,
            brand,
            weight,
            weightUnit,
            volume,
            volumeUnit,
            isAvailable,
            supplierId
        })

        if(productInsertedStatus){
            return res.json(
                new ApiResponse(201, productInsertedStatus, "product added successfully")
            )
        }else{
            return res.jsno(
                new ApiError(500, "some internal server error occured.")
            )
        }
    }
}) 

// ye sara product list karega
const getAllProduct = asyncHandler( async(req, res) => {
    
    /* 1. make the db call 
       2. get the product
       3. hide the extra data 
       4. pass it to the frontend
    */

    const productList = await Product.find({isAvailable: true})
    
    if(!productList || productList.length === 0){
        throw new ApiError(404, "no product available")
    }

    return res.json(new ApiResponse(200, productList, "product fetch successfully"))
})

//ye specific product ko usske id se find out karega
const getProductById = asyncHandler( async(req, res) => {
    const productId = req.params
    const  productInformation = Product.findById(productId)

    if(!productInformation){
        throw new ApiError(404,"product not found")
    }

    return res.json(
        new ApiResponse(200, "product fetched successfully")
    )

})


export {
    createNewProduct,
    getAllProduct,
    getProductById
}