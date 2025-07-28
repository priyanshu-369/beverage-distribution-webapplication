import ApiError from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";

export const verifyJWT = (allowedRoles) => {

    return asyncHandler(async (req, res, next) => {
        try {
            //yaha pe token ko nikalenge user(client) request se matlab user ke pass token hai ki nahi
            const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
            if (!token) {
                throw new ApiError(401, "Authentication token is missing. Please log in.");
            }

            // yaha check hoga ki token match horaha hai ki nahi
            const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
            if (!user) {
                throw new ApiError(401, "Invalid authentication token: User not found.");
            }
            const roleToCheck = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]
            if (roleToCheck.includes(user.role)) {
                req.user = user;
                next();
            } else {
                throw new ApiError(403, "Access Forbidden: You do not have the required permissions.");
            }
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new ApiError(401, "Authentication token has expired. Please log in again.");
            }
            if (error instanceof jwt.JsonWebTokenError) {
                throw new ApiError(401, "Invalid authentication token. Please log in again.");
            }
            throw new ApiError(500, error.message || "An unexpected error occurred during authentication.");
        }
    });
}