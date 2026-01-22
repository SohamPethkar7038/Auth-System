import { verify } from "jsonwebtoken";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const UserScehma= new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    verifyOtp:{
        type:String,
        default:'',
    },
    verifyOtpExpireAt:{
        type:Number,
        default:0,
    },
    isAccountVerified:{
        type:Boolean,
        default:false,
    },
    resetOtp:{
        type:String,
        default:'',
    },
    resetOtpExpireAt:{
        type:Number,
        default:0,
    },
},
{
    timestamps:true,
})

UserScehma.pre("save",async function(next){
    if(!this.isModified("password")) return next();

    this.password=await bcrypt.hash(this.password,10);
    next();
})

UserScehma.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password,this.password);
}


const UserModel=mongoose.models.user || mongoose.model("User",UserScehma);

export default UserModel;

