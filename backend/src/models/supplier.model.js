import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        contactPerson: {
            type: String,
            trim: true
        },
        email: {
            type: String,
            lowercase: true,
            trim: true,
            unique: true,
            sparse: true
        },
        phoneNumber: {
            type: String,
            required: true,
            trim: true,
        },
        address: {
            type: String,
            required: true,
            trim: true
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {timestamps: true})

    const Supplier =  mongoose.model("Supplier", supplierSchema)
    export default Supplier;