import mongoose from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import aggregatePaginate from "mongoose-aggregate-paginate-v2"

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true
        },
        avatar: {
            type: String
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            unique: true,
            trim: true,
            index: true
        },
        phone: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: [true, " password is required " ]

        },
        role: {
            type:String,
            enum: ["admin", "customer", "staff", "driver"],
            default: "customer",
            required: true
        },
        isEmailVerified: {
            type: Boolean,
            default: false
        },
        isActive: {
                type: Boolean,
                default: true
        },
        deactivationReason: {
            type: String
        },
        deactivatedByUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        refreshToken: {
            type: String
        }
    },
    {
        timestamps:true
    });


userSchema.plugin(aggregatePaginate)
//ye middleware har bar call hoga koi document save hone se pehle user collection mein
userSchema.pre("save" ,async function(next){
    if(!this.isModified("password")){
        return next()
    }
    this.password = await bcrypt.hash(this.password, 9)
    next()
})

userSchema.methods.checkPassword = async function(password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id:this.id,
            email:this.email,
            isActive: this.isActive
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this.id,
            email: this.email
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY 
        }
    )
}

const User = mongoose.model("User", userSchema);
export default User;
