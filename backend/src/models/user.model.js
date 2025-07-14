import mongoose from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

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
        phoneNumber: {
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



const User = new mongoose.model("User", userSchema);

//ye middleware har bar call hoga koi document save hone se pehle user collection mein
User.pre("save" ,async function(next){
    if(!this.isModified("password")){
        return next()
    }
    this.password = await bcrypt.hash(this.password, 9)
    next()
})

User.methods.checkPassword = async function(password){
    return await bcrypt.compare(password, this.password)
}

User.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            id:this.id,
            email:this.email,
            isActive: this.isActive
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

User.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            id: this.id,
            email: this.email
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY 
        }
    )
}

export default User;
