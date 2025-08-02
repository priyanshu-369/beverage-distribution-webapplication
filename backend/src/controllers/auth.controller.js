
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import  User  from "../models/user.model.js"
import asyncHandler   from "../utils/asyncHandler.js"
import { sendRegistrationMail, sendOtpMail } from "../utils/mailerservice.js"
import  redis  from "../db/redisdb.js"
import crypto from "crypto"



 const generateOtp = () => {
    return crypto.randomInt(10000, 99999).toString();
}

const generatePasswordResetToken = () => {
    return crypto.randomBytes(32).toString('hex');
}

const generateProfileImageUrl = function(fullName) {
  if (typeof fullName !== 'string' || !fullName.trim()) {
    throw new Error('Invalid full name');
  }
  const names = fullName.trim().split(' ');
  let formattedName;
  if (names.length > 1) {
    const firstNameInitial = names[0][0].toUpperCase();
    const lastNameInitial = names[names.length - 1][0].toUpperCase();
    formattedName = `${firstNameInitial}+${lastNameInitial}`;
  } else {
    const singleInitial = names[0][0].toUpperCase();
    formattedName = singleInitial;
  }
  let backgroundColor;
  do {
    backgroundColor = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  } while ((parseInt(backgroundColor.substring(0, 2), 16) * 299 + parseInt(backgroundColor.substring(2, 4), 16) * 587 + parseInt(backgroundColor.substring(4, 6), 16) * 114) / 1000 < 128);
  return `https://ui-avatars.com/api/?name=${formattedName}&bold=true&size=128&background=${backgroundColor}&color=000000`;
}

// method to generate the accesstoken and the refresh token
const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: true})

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token")
    }
}

// capitalize first letter of fname & last name
function capitalizeFullName(fullName) {
    return fullName
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

// below the register user logic
const registerUser = asyncHandler ( async(req, res) => {

    /*  step 1. get user details
        step 2. get the validations check
        step 3. check if user already exist : email and phone
        step 4. create user object - create entry in the DB
        step 5. remove password and refreshtoken field
        step 6.return resopnse using res
    */
    const {fullName, email, phone, password, role = "customer" } = req.body

    if(
        [fullName, email, phone, password ].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400,"All fields are required");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email)){
        throw new ApiError(400,"Invalid email format. ")
    }
    if(password.length < 8){
        throw new ApiError(400,"To short password, At least 8 character required. ")
    }

    const userExistWithMailPhone = await User.findOne({$or: [{email}, {phone}]})    
    if(userExistWithMailPhone){
        throw new ApiError(409, "User with same email or phone already exist. ")
    }

    const avatar = generateProfileImageUrl(fullName)
    const user = await User.create({
                                fullName,
                                email,
                                avatar,
                                password,
                                phone,
                                role          
                            }) 

    if(!user){
        throw new ApiError(500,"Something unexpected happened while registering the user.")
    }

    const userCreated = {
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role
    }
    
    const username = capitalizeFullName(userCreated.fullName);
    const mailToUser = userCreated.email
    sendRegistrationMail(mailToUser, username)

    return res.status(201).json(
      new ApiResponse(201, userCreated ,"User registered successfully. ")
    )
})

// user login logic
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email?.trim() || !password?.trim()) {
        throw new ApiError(400, "Email and Password required");
    }

    const userExist = await User.findOne({ email });
    if (!userExist) {
        throw new ApiError(404, "User not found.");
    }

    const userVerified = await userExist.isPasswordCorrect(password);
    if (!userVerified) {
        throw new ApiError(400, "Password incorrect.");
    }
    console.log("User Verified!");

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(userExist._id);
    const loggedInUser = await User.findById(userExist._id).select("-password -refreshToken -role");

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        path: "/"
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged in successfully!!"));
});

// user logout logic
const logoutUser = asyncHandler(async (req, res) => {
    if (!req.user?._id) {
        return res.status(401).json(new ApiResponse(401, null, "Unauthorized request: user not authenticated. "));
    }

    const loggedoutUser = await User.findByIdAndUpdate(req.user._id, {
        $unset: { refreshToken: "" } 
    });

    const options = {
        httpOnly: true,
        sameSite: "None",
        path: "/",
        secure: process.env.NODE_ENV === "production",
    };

    return res
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .status(200)
        .json(new ApiResponse(200, null, "User logged out successfully!"));
});

  // Send OTP and store in Redis
  const verifyUserSendOtp = asyncHandler(async (req, res) => {
    const { contact } = req.body;
    if (!contact) {
      throw new ApiError(400, "Email or phone not specified.");
    }
  
    const user = await User.findOne({
      $or: [{ email: contact }, { phone: contact }],
    })
    if (!user) {
      throw new ApiError(404, "User not found.");
    }
  
    const otp = generateOtp();
    const expiresIn = 180; 
  
    // Store OTP in Redis with expiration time
    await redis.setex(`otp:${contact}`, expiresIn, otp);
  
    const userEmail = user.email;
    const userName = user.fullName; // Assuming fullName exists
  
    await sendOtpMail(userEmail, userName, otp);
  
    res.status(200).json(
      new ApiResponse(200, {success: true}, "OTP sent successfully. Please check your inbox.")
    );
  });
  
  // Verify OTP using Redis
const verifyOtp = asyncHandler(async (req, res) => {
    const { contact, userOtp } = req.body;
  
    if (!contact || !userOtp) {
      throw new ApiError(400, "Contact and OTP are required.");
    }
  
    // Retrieve OTP from Redis
    const storedOtp = await redis.get(`otp:${contact}`);
    if (!storedOtp) {
      throw new ApiError(400, "OTP has expired or is not valid.");
    }
  
    if (userOtp !== storedOtp) {
      throw new ApiError(400, "Invalid OTP.");
    }
  
    // Delete OTP from Redis after successful verification
    await redis.del(`otp:${contact}`);

    const user = await User.findOne({
        $or: [{ email: contact }, { phone: contact }]
    });
    if(!user) {
        throw new ApiError(404, "User not found after OTP verification.");
    }

    const passwordResetToken = generatePasswordResetToken();
    // Now we update the nested object
    user.passwordReset = {
      token: passwordResetToken,
      expiry: Date.now() + 10 * 60 * 1000 // Token expires hoga 10 minutes
    }
    await user.save()
    return res.status(200).json(new ApiResponse(200, {passwordResetToken, success: true}, "OTP validated."));
  });

const resetPassword = asyncHandler(async (req, res) => {
    const { resetPasswordToken , newPassword } = req.body;
    if(!resetPasswordToken || resetPasswordToken.trim() === ""){
      throw new ApiError(403, "User unauthorized to change password. ")
    }

    if(newPassword === null  || newPassword.trim() === ""|| !newPassword){
      throw new ApiError(403, "Provide with new password . ")
    }
  
    const user = await User.findOne({
      "passwordReset.token" : resetPasswordToken,
      "passwordReset.expiry": { $gt : Date.now()}
     }).select('+passwordReset.token +passwordReset.expiry')
    
    if (!user) {
      throw new ApiError(400, "Invalid password reset token. ");
    }

    user.password = newPassword;
    user.passwordReset = undefined;
    await user.save();

    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully."));
  });

  
export  {
    registerUser,
    loginUser,
    logoutUser,
    generateOtp,
    verifyUserSendOtp,
    verifyOtp,
    resetPassword
}