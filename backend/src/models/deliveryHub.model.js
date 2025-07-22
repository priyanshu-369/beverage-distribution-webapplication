
import mongoose from "mongoose";

const deliveryHubSchema = new mongoose.Schema(
    {
        name: { 
            type: String, // hub ka naam ("goregaon hub") ("main hub")
            required: true, 
            unique: true, 
            trim: true 
        }, 
        addressId: { // Reference karega Address model ko jisse hub ka physical address pata hoga
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Address',
            required: true,
            unique: true
        },
         location: {
            type: {
                type: String,
                enum: ['Point'],
                default: "Point",
                required: true
            },
            coordinates: { // [longitude, latitude] - REQUIRED for geospatial queries
                type: [Number],
                required: true,
                index: '2dsphere' // Create a 2dsphere index for efficient geospatial queries
            }
        },
        // --- ESSENTIAL ADDITION: Numerical radius defining the hub's immediate service range ---
        operationalRadius: { // Radius in kilometers that this hub primarily serves customers
            type: Number,
            min: 0,
            required: true
        },
        servedZoneIds: [{ // List of Zones (from zone se) ye hub serve karega order ko
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Zone'
        }],
        contactPerson: { // Contact person jo main manager rahega waha ka(staff)
            type: String, trim: true 
        }, 
        phoneNumber: { 
            type: String, trim: true 
        },
        capacityDescription: { //kitna space hai vo 
             type: String
        }, 
        isOperational: { // kya ye hub currently operational?
            type: Boolean, default: true
         } 
    },
    { timestamps: true   }
);

const DeliveryHub = mongoose.model("DeliveryHub", deliveryHubSchema);
export default DeliveryHub;