import Product from "../models/product.model.js"
import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import { uploadOnCloudinary,  destroyFromCloudinary } from "../utils/cloudinary.js"


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
            const imageUploadInformation = await uploadOnCloudinary(fileObject.path)
            if(!imageUploadInformation || !imageUploadInformation.url || !imageUploadInformation.publicId){
                throw new ApiError(500, `Failed to upload image ${fileObject.originalname}. try again later`)
            }
            return imageUploadInformation;
        }else{
            throw new ApiError(500, "missing local path of image")
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

// ye update karega product ke details ko product image ko update karne ka koi aur tarika hai
const updateProductDetail = asyncHandler( async(req, res) => {
    const { productId } = req.params;
    const productExist = await Product.findById(productId)
    if(!productExist){
        throw new ApiError(404," product not found invalid product id. ")
    }
    const productCategory = productExist.category;

    let updatedFields = {}
    const { body } = req;

    const commonUpdateableFields = ['name', 'description', 'basePrice', 'subCategory', 'brand', 'supplierId']

    const machineSpecificUpdateableFields = ['capacity', 'powerConsumption', 'weight']
    const beverageSpecificUpdateableFields = ['volume', 'volumeUnit', 'weight', 'weightUnit', 'packagingType']

    const immutableFields = ["_id", "sku", "productCode", "category"]

    for( let key in body){
        if(body.hasOwnProperty(key)){
            const value = body[key];

            if(immutableFields.includes(key)) continue;
            if(value === null || value === undefined) continue;
            if(typeof value === "string" && value?.trim() === ""){
                throw new ApiError(400,`invalid input : product ${key} is empty`)
            }
            if(typeof value === "number" && value < 0){
                throw new ApiError(400,`invalid input : product ${key} can't be negative`)
            }

            if(commonUpdateableFields.includes(key)){
                updatedFields[key] = value;
            }else if(productCategory === "machine" && machineSpecificUpdateableFields.includes(key)){
                updatedFields[key] = value;
            }else if(productCategory === "beverage" && beverageSpecificUpdateableFields.includes(key)){
                updatedFields[key] = value;
            }else{
                    console.warn(`Attempted to update unknown or disallowed field : ${key} for product ${productId}`)
            }
        }
    }

    if(Object.keys(updatedFields).length === 0){
        throw new ApiError(400, "no fields provided for product update. ")
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        {$set: updatedFields},
        {new: true, runValidators: true}
    );

    if(!updatedProduct){
        throw new ApiError(500,"internal error: failed to update the product")
    }

    return res.json(
        new ApiResponse(200, updatedProduct, "product details updated successfully. ")
    )
})

//yaha product image ko update hoga aur old image ko destroy karega
const updateProductImage = asyncHandler( async(req, res) => {
    const {productId} = req.params
    if(!productId){
        throw new ApiError(400,"product id field is empty")
    }
    const productExist = await Product.findById(productId)
    if(!productExist){
        throw new ApiError(404,"product not found")
    }

    const newProductImage = req.files.productImage
    if(!newProductImage || newProductImage.length === 0){
        throw new ApiError(400,"No new image is provided to update.")
    }

    const oldProductImage = productExist.images;

    if(oldProductImage.length > 0){
       
        const deleteOldProductImage = oldProductImage.map( async(image) => {
            if(!image || !image.url || !image.publicId){
                console.warn("no image or image public id provided")
                return {
                    status: "failed",
                    reason: "No public id provided"
                }
            }else{
                return await destroyFromCloudinary(image.publicId)
            }
        })
        await Promise.all(deleteOldProductImage)
    }

    const newProductImageUpload = newProductImage.map( async(image) => {
        if(image.path){
             return await uploadOnCloudinary(image.path) 
        }else{
            throw new ApiError(400,"file path not provided")
        }
    })

    const imageUploaded = await  Promise.all(newProductImageUpload)
    const newImageUploaded = await Product.findByIdAndUpdate(
        productId,
        {$set: {images: imageUploaded}},
        {new: true, runValidators: true}
    )

    if(!newImageUploaded){
        throw new ApiError(500,"failed to update product Image")
    }
    return res.json(
        new ApiResponse(200, newImageUploaded, "successfully updated product image")
    )
})

//yaha product ka document delete hoga aur clodinary ka image bhi
const deleteProductById = asyncHandler( async(req, res) =>{
    const {productId} = req.params

    const productExist = await Product.findById(productId);
    if(!productExist){
        throw new ApiError(404, "product not found. required valid product id to delete product. ")
    }

    
    const productImagesPublicId = productExist.images.map(image => image.publicId).filter(id => id) 

    if(productImagesPublicId > 0){
        const deleteImagePromise = productImagesPublicId.map( async(publicId) => {
            return await destroyFromCloudinary(publicId)
        });
        await Promise.all(deleteImagePromise)
    }

    const deleteProduct = await Product.findByIdAndDelete(productId)
    if(!deleteProduct){
        throw new ApiError(500," internal error: failed to delete product")
    }
    return res.json(
        new ApiResponse(200, deleteProduct, "product deleted successfully")
    )
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
    updateProductDetail,
    updateProductImage,
    deleteProductById,
    getAllProduct,
    getProductById
}