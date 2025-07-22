import mongoose from "mongoose"

const deliveryPartnerSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },
        licenseNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        vehicleDetails: {
            type: String,
            required:true,
            trim: true
        },
        vehicleType: {
            type: String,
            enum: ["2-wheeler", "4-wheeler", "truck"],
            required: true,
            index: true
        },
        vehicleOwnershipType: {
            type: String,
            enum: ["company_owned", "partner_owned"],
            required: true,
            default: "partner_owned"
        },
        vehicleLoadCapacity: {
            type: Number,
            default: 0,
            required: true
        },
        employmentType: {
            type: String,
            enum: ["employee", "contractor"],
            required: true,
            default: "contractor",
            index: true
        },
        currentLocation: { //geojson use karenge
            type: {
                type: String,
                enum:['Point'],
                default: "Point",
                required: true
            },
            coordinates: {
            type: [Number],
            required: true,
            index: '2dsphere'
            }
        },
        currentLoad: {
            type: Number,
            default: 0,
            min: 0
        },
        basePostalCode: {
            type:String,
            required: true,
            trim: true,
            index: true
        },
        operationalZoneIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Zone",
                index: true
            }
        ],
        currentStatus: {
            type: String,
            enum: ["available", "on duty", "off duty", "break", "busy"],
            default:"off duty",
            required: true,
            index: true
        },
        lastLocationUpdate: {
            type: Date
        },
        performanceRating: {
            type: Number,
            min: 1.0,
            max: 5.0
        },
        driverRatingCount: {
            type: Number,
            default: 0
        },
        totalDeliveriesCompleted: {
            type: Number,
            default: 0
        },
        lastDeliveryCompletedTimestamp: {
            type: Date
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {timestamps: true});

 
const DeliveryPartner = mongoose.model("DeliveryPartner",deliveryPartnerSchema);
export default DeliveryPartner;