import { Router } from "express";
import { loginUser, logoutUser, registerUser, verifyOtp, verifyUserSendOtp, resetPassword } from "../controllers/auth.controller";
const router = Router()
import { verifyJWT } from "../middlewares/auth.middleware";

//auth route to register user
router.route("/register").post(registerUser)

//route to login user
router.route("/login").post(loginUser)

//yaha se direct logout hoga
router.route("/logout").patch(verifyJWT(["admin", "staff", "customer", "driver"]), logoutUser)

// yaha se forget password to reset pass word ke liye mail ke throught otp send karenge
router.route("/forgot-password/send-otp").post(verifyUserSendOtp)

//yaha verify hoga otp
router.route("/forgot-password/verify-otp").post(verifyOtp)

//yaha password reset hoga
router.route("/reset-password").patch(resetPassword)

export default router