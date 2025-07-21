import mongoose from "mongoose"
import aggregatePaginate from "mongoose-aggregate-paginate-v2"


const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        sku: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true
        },
        productCode: {
            type: String,
            unique:true,
            trim: true,
            index: true
        },
        images: {
            type: [String],
            default: []
        },
        basePrice: {
            type: Number,
            required: true,
            min: 0
        },
        category: {
            type: String,
            required: true,
            enum: ["beverage", "machine", "accessory" ],
            default: "beverage"
        },
        subCategory: {
            type: String,
            trim: true
        },
        brand: {
            type: String,
            trim: true
        },
        volume: {
            type: String // volume mean quantity(in ml l or other liquid units)
        },
        volumeUnit: {
            type: String // volume ya qunatity ka unit
        },
        weight: {
            type: Number,
            min: 0,
            default: 0,
            required: true
        },
        weightUnit: {
            type: String,
            required: true
        },
        packagingType: { 
            type: String, 
            enum: ['plastic Bottle', 'reusable can', 'glass bottle', 'carton', 'cardboard pack', 'shrink-wrapped bottles'] 
        },
        capacity: {
            type: String,
        },
        powerConsumption: {
            type: String
        },
        supplierId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Supplier",
            index: true
        },
        isAvailable: {
            type: Boolean,
            default: false
        }
    }
    ,{timestamps: true}
)


productSchema.plugin(aggregatePaginate)

productSchema.methods.getFormattedPrice = function(){
    return `₹ ${this.basePrice}`
}

const Product =  mongoose.model("Product", productSchema);
export default Product;