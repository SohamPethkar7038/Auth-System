import express from "express";
import UserModel from "../models/user.model.js";
import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import getUserData from "../controllers/userDetails.controller.js";


const userRouter=express.Router();

userRouter.route("/data").get(verifyJWT,getUserData);


export default userRouter;