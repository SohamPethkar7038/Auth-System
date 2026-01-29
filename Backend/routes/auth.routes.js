import { Router } from "express"
import {registerUser} from "../controllers/auth.controller.js"
import { loginUser } from "../controllers/auth.controller.js";
import { logoutUser } from "../controllers/auth.controller.js";
import verifyJWT  from "../middlewares/auth.middleware.js";
import { sendVerifyOTP } from "../controllers/auth.controller.js";
import { verifyEmailOtp } from "../controllers/auth.controller.js";
import { userIfAuthenticate } from "../controllers/auth.controller.js";



const router=Router();

router.route("/register").post(registerUser);

router.route('/login').post(loginUser);

router.route('/logout').post(verifyJWT,logoutUser);

// *** email verification***

router.route("/send-verification-otp").post(verifyJWT,sendVerifyOTP);
router.route("/verify-email").post(verifyJWT,verifyEmailOtp);
router.route("/isauth").post(verifyJWT,userIfAuthenticate);

export default router;