import { Router } from "express"
import {registerUser} from "../controllers/auth.controller.js"
import { loginUser } from "../controllers/auth.controller.js";
import { logoutUser } from "../controllers/auth.controller.js";
import verifyJWT  from "../middlewares/auth.middleware.js";



const router=Router();

router.route("/register").post(registerUser);

router.route('/login').post(loginUser);

router.route('/logout').post(verifyJWT,logoutUser);

export default router;