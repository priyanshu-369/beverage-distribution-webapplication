import Product from "../models/product.model.js"
import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import uploadOnCloudinary from "../utils/cloudinary.js"

// way to register product only using category === machine
// second way to register product only using category === beverage
// if not found any one an error
const createNewProduct = asyncHandler( async(req, res) => {
    const { category} = req.body;
    let productObject ={}
    if(!category || category === ""){
        throw new ApiError(400, "category undefined")
    }

    if(category === "machine"){
        const {name, description, sku, productCode, basePrice, subCategory, brand, weight, capacity, powerConsumption, supplierId, isAvailable} = req.body;
        const productFields = [
            {key: "name", value: name},
            {key: "description", value: description},
            {key: "sku", value: sku},
            {key: "productCode", value: productCode},
            {key: "basePrice", value: basePrice},
            {key: "category", value: category},
            {key: "subCategory", value: subCategory},
            {key: "brand", value: brand},
            {key: "weight", value: weight},
            {key: "capacity", value: capacity},
            {key: "powerConsumption", value: powerConsumption},
            {key: "isAvailable", value: isAvailable},
            {key: "supplierId", value: supplierId},
        ]
        productFields.forEach(field => {
            if(field.value === null || field.value === undefined){
                throw new ApiError(400, `Invalid input: product ${field.key} is empty. `)
            }
            if(typeof (field.value) === "string" && field.value?.trim() === ""){
                throw new ApiError(400, `Invalid input: product ${field.key} is empty. `)
            }
            if(typeof (field.value) === "number" && field.value < 0 ){
                throw new ApiError(400, `Invalid input: product ${field.key} is empty. `)
            }
            productObject[field.key] = field.value
        })
        
    }else if (category === "beverage") {
        const {name, description, sku, productCode, basePrice, subCategory, brand, weight, weightUnit, volume, volumeUnit, packagingType, supplierId, isAvailable} = req.body;

        const beverageFields = [
            {key: "name", value: name},
            {key: "description", value: description},
            {key: "sku", value: sku},
            {key: "productCode", value: productCode},
            {key: "basePrice", value: basePrice},
            {key: "category", value: category},
            {key: "subCategory", value: subCategory},
            {key: "brand", value: brand},
            {key: "weight", value: weight},
            {key: "weightUnit", value: weightUnit},
            {key: "volume", value: volume},
            {key: "volumeUnit", value: volumeUnit},
            {key: "packagingType", value: packagingType},
            {key: "isAvailable", value: isAvailable},
            {key: "supplierId", value: supplierId},
        ];

        for (const field of beverageFields) {
            if (field.value === null || field.value === undefined) {
                throw new ApiError(400, `Invalid input: product field '${field.key}' is missing.`);
            }
            if (typeof field.value === 'string' && field.value.trim() === '') {
                throw new ApiError(400, `Invalid input: product field '${field.key}' cannot be an empty string.`);
            }
            if (typeof field.value === 'number' && field.value < 0) {
                throw new ApiError(400, `Invalid input: product field '${field.key}' cannot be negative.`);
            }
            productObject[field.key] = field.value;
        }

    }else{
        throw new ApiError(400, "Invalid product category provided. ")
    }

    const productImagesLocalPath = req.files?.productImage
    if(!productImagesLocalPath && productImagesLocalPath.length === 0){
        throw new ApiError(400, "at least product image required")
    }

    const uploadImagePromise = productImagesLocalPath.map( async(fileObject) => {
        if(fileObject.path){
            const imageUrl = await uploadOnCloudinary(fileObject.path)
            if(!imageUrl){
                throw new ApiError(500, `Failed to upload image ${fileObject.originalname}. try again later`)
            }
            return imageUrl;
        }else{
            throw new ApiError(500, "missing local path image")
        }
    })

    const uploadedImagesUrl = await Promise.all(uploadImagePromise)
    productObject.images = uploadedImagesUrl;

    const productInserted = await Product.create(productObject)
    if(!productInserted){
        throw new ApiError(500, "internal server error occured. faild to add product.")
    }

    return res
    .json(new ApiResponse(201, productInserted, "product added successfully."))

}) 

// ye sara product list karega with query or whithout query
const getAllProduct = asyncHandler( async(req, res) => {
    let query = req.query;
    let filter = {}
    const limit = parseInt(query.limit) || 10
    const page = parseInt(query.page) || 1;

    if(query && Object.keys(query).length > 0){ 
        if(query.brand !== "" && query.brand) filter.brand = query.brand;
        if(query.volume !== "" && query.volume) filter.volume = { $lte : parseInt(query.volume)};
    }
    const totalProducts = await Product.countDocuments(filter)
    const totalPages = Math.ceil(totalProducts / limit)
    const skip = ( page - 1 ) * limit

    const productList = await Product.find(filter)
            .limit(limit)
            .skip(skip)
            .select(" -supplierId ")
            .exec()

    if(productList.length <= 0){
        throw new ApiError(404, "unable to find products")
    }

    const productDetail = {
        products: productList,
        totalProducts: totalProducts,
        totalPages: totalPages,
    }

    return res.json(
        new ApiResponse(200, productDetail, "products fetched succefully")
    )  
})

//ye specific product ko usske id se find out karega
const getProductById = asyncHandler( async(req, res) => {
    const productId = req.params.id
    const  productInformation = Product.findById(productId)
        .select("-supplierId")

    if(!productInformation && productInformation === ""){
        throw new ApiError(404,"product not found")
    }

    return res.json(
        new ApiResponse(200, productInformation, "product fetched successfully")
    )
})






export {
    createNewProduct,
    getAllProduct,
    getProductById
}