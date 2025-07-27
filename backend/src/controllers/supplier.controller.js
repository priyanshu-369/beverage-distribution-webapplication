import ApiError from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";
import Supplier from "../models/supplier.model.js"
import ApiResponse from "../utils/ApiResponse";


const createNewSupplier = asyncHandler( async (req, res) => {
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


export {
    createNewSupplier,
    updateSupplierDetail
}