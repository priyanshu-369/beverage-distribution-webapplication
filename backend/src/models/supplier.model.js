import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
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
        leadTimeDays: {
                type: Number,
                required: true
        },
        paymentTerms: {
            type: String,
            enum: ["NET 15", "NET 30", "COD", "PREPAID"],
            required: true
        },
        isArchived: {
            type: Boolean,
            default: false
        }

    },
    {timestamps: true})


supplierSchema.methods.getAverageLeadDays = function(){
    return this.leadTimeDays;
}

supplierSchema.methods.getFormattedContactInfo = function(){
    let contactInfo = []
    if(this.email && this.email.trim() !== "") contactInfo.push(this.email);
    if(this.phoneNumber && this.phoneNumber.trim() !== "") contactInfo.push(this.phoneNumber);
    if(this.contactPerson.trim() !== "") contactInfo.push(this.contactPerson);
    if(contactInfo.length === 0) return;

    return contactInfo.join(" | ");
}

supplierSchema.methods.getPaymentTermDescription = function(){
    let paymentTermsTemplate = {
        "NET 15": "payment due 15 days after invoice",
        "NET 30": "payment due 30 days after invoice",
        "COD": "cash on delivery",
        "PREPAID": "payment required before shipment"
    }
       
    return paymentTermsTemplate[this.paymentTerms] || "unknown payment type"

}

supplierSchema.methods.isSupplierActive = function(){
    return this.isActive;
}

const Supplier =  mongoose.model("Supplier", supplierSchema);
export default Supplier;