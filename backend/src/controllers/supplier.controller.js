import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import Supplier from "../models/supplier.model.js"
import ApiResponse from "../utils/ApiResponse.js";


const createNewSupplier = asyncHandler( async (req, res) => {
    const {role: authorizedRole} = req.user;
    if(!["admin", "staff"].includes(authorizedRole)){
        throw new ApiError(403, "Access Forbidden: You do not have the required permissions.")
    }

    const {name, contactPerson, email, phoneNumber, address, leadTimeDays, paymentTerms, isArchived} = req.body;
    const checkSupplierExist = await Supplier.findOne({$or:[{email: email}, {name: name}]})
    if(checkSupplierExist){
        throw new ApiError(409,"supplier already exist. ")
    }
    let supplierObject = {};
    const supplierField = [
        {key:"name", value: name },
        {key:"contactPerson", value: contactPerson },
        {key:"email", value: email },
        {key:"phoneNumber", value: phoneNumber },
        {key:"address", value: address },
        {key:"leadTimeDays", value: leadTimeDays },
        {key:"paymentTerms", value: paymentTerms },
        {key:"isArchived", value: isArchived },

    ]
    
    supplierField.map(field => {
        if(field.value === null || field.value === undefined){
            throw new ApiError(400, `invalid input supplier ${field.key} is empty.`)
        }
       
        if(typeof (field.value) === "string" && field.value.trim() === ""){
            throw new ApiError(400, `invalid input supplier ${field.key} is empty. `)
        }
        if(typeof (field.value) === "number" && field.value < 0){
            throw new ApiError(400, `invalid input supplier ${field.key} shouldn't be less then 0. `)
        }
        supplierObject[field.key] = field.value;
    })
    
    const supplierCreated = await Supplier.create(supplierObject)
    if(!supplierCreated){
        throw new ApiError(500, "internal error: failed to create supplier. ")
    }

    return res.json(
        new ApiResponse(201, supplierCreated, "supplier register successfully. ")
    )
})

const updateSupplierDetail = asyncHandler( async(req, res) => {
    const {role: authorizedRole} = req.user;
    if(!["admin", "staff"].includes(authorizedRole)){
        throw new ApiError(403, "Access Forbidden: You do not have the required permissions.")
    }

    const {supplierId} = req.params;
    const {body} = req;
    const checkSupplierExist = await Supplier.findById(supplierId)
    if(!checkSupplierExist){
        throw new ApiError(404,"supplier not found. ")
    }

    const supplierUpdateableField = ["name", "phoneNumber", "contactPerson", "address", "paymentTerms"]
    const supplierImmutableFields = ["_id", "email", "isArchived"]
    let updateSupplierFields = {}

    for(let key in body){
        if(body.hasOwnProperty(key)){
            const value = body[key];
        
            if(supplierImmutableFields.includes(key)) continue;
            if(value === null || value === undefined) continue;
            if(typeof value === "string" && value.trim() === ""){
                throw new ApiError(400, `invalid input supplier ${key} is empty. `)
            }
            if(typeof value === "number" && value < 0){
                throw new ApiError(400, `invalid input supplier ${key} can't be negative value. `)
            }
        
            if(supplierUpdateableField.includes(key)){
                updateSupplierFields[key] = value
            }
        }
    }

if(Object.keys(updateSupplierFields).length === 0){
    throw new ApiError(400, "bad request no field provided to update supplier.")
}

    const supplierUpdated = await Supplier.findByIdAndUpdate(
        supplierId,
        {$set: updateSupplierFields},
        {runValidators: true}
    )

    if(!supplierUpdated){
        throw new ApiError(500, "internal error failed to update supplier. ")
    }

    return res.json(
        new ApiResponse(200, supplierUpdated, "supplier updated successfully. ")
    )
})

const toggleSupplierArchive = asyncHandler( async(req, res) => {
    const {role: authorizedRole} = req.user;
    if(!["admin", "staff"].includes(authorizedRole)){
        throw new ApiError(403, "Access Forbidden: You do not have the required permissions.")
    }

    const {supplierId} = req.params
    const checkSupplierExist = await Supplier.findById(supplierId)
    if(!checkSupplierExist){
        throw new ApiError(404, "Supplier not found. ")
    }
    let toggleArchiveStatus;
    const previousArchiveStatus = checkSupplierExist.isArchived 
    const newArchiveStatus = !previousArchiveStatus
    if(userRole === "admin"){   
        if(previousArchiveStatus === true){
            toggleArchiveStatus = "unarchive"
        }else{
            toggleArchiveStatus = "archive"
        }
    }else if(userRole === "staff" && previousArchiveStatus === false){
        toggleArchiveStatus = "archive"
    }else{
        throw new ApiError(403, "user is not allowed to access resource. ")
    }
    const updateSupplierArchive = await Supplier.findByIdAndUpdate(
        supplierId, 
        {$set : {isArchived : newArchiveStatus}},
        {runValidators: false}
    )
    if(!updateSupplierArchive){
        throw new ApiError(500, `Internal Error failed to ${toggleArchiveStatus} supplier.`)
    }
    return res.json(
        new ApiResponse(200, updateSupplierArchive, `supplier ${toggleArchiveStatus}d successfully.`)
    )
})

const getSupplierById = asyncHandler( async(req, res) => {
    const {role: authorizedRole} = req.user;
    if(!["admin", "staff"].includes(authorizedRole)){
        throw new ApiError(403, "Access Forbidden: You do not have the required permissions.")
    }

    const {supplierId} = req.params
    const checkSupplierExist = await Supplier.findById(supplierId)
    if(!checkSupplierExist){
        throw new ApiError(404, "Supplier not found. ")
    }
    return res.json(
        new ApiResponse(200, checkSupplierExist, "supplier fetched successfully. ")
    )
})

const getAllSupplier = asyncHandler( async(req, res) => {
    const {role: authorizedRole} = req.user;
    if(!["admin", "staff"].includes(authorizedRole)){
        throw new ApiError(403, "Access Forbidden: You do not have the required permissions.")
    }

    const query = req.query;
    let finalFilter = {};
    const limit = parseInt(query.limit) || 10;
    const page = parseInt(query.page) || 1;
    const skip = (page - 1) * limit;

    const conditions = [];

    if (query.isArchived === 'true') { 
    } else {
        conditions.push({ isArchived: false }); 
    }

    const searchTerm = query.search;
    if (searchTerm) {
        const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const words = escapedSearchTerm.split(/\s+/).filter(Boolean);
        const regexPattern = words.map(word => `(?=.*\\b${word}\\b)`).join('') + '.*';
        const regex = new RegExp(regexPattern, 'i');

        const searchConditions = [
            { name: { $regex: regex } },
            { email: { $regex: regex } },
            { contactPerson: { $regex: regex } },
            { phoneNumber: { $regex: regex } }
        ];
        conditions.push({ $or: searchConditions });
    }

    if (conditions.length > 0) {
        finalFilter = { $and: conditions };
    } else {
        finalFilter = {};
    }

    const totalSuppliers = await Supplier.countDocuments(finalFilter);
    const totalPages = Math.ceil(totalSuppliers / limit);

    const supplierList = await Supplier.find(finalFilter)
        .limit(limit)
        .skip(skip)
        .exec(); 

    const supplierDetail = {
        suppliers: supplierList,
        totalSuppliers: totalSuppliers,
        totalPages: totalPages,
        currentPage: page,
        limit: limit
    };

    return res.json(
        new ApiResponse(200, supplierDetail, "Suppliers data fetched successfully.")
    );
});

export {
    createNewSupplier,
    updateSupplierDetail,
    toggleSupplierArchive,
    getSupplierById,
    getAllSupplier
}