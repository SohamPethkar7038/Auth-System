
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
        required:true,
        select:false,
    },
    verifyOtpExpireAt:{
        type:Date,
        default:0,
        required:true,
        select:false,
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
        type:Date,
        default:0,
    },
    passwordResetRequestedAt: {
    type: Number,
    },
    refreshToken:{
        type:String,
    }
},
{
    timestamps:true,
})

UserScehma.pre("save",async function(){
    if(!this.isModified("password")) return;

    this.password=await bcrypt.hash(this.password,10);
   
})

UserScehma.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password,this.password);
}

UserScehma.methods.generateAccessToken=function(){
    return jwt.sign(
        {
            _id:this._id,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

UserScehma.methods.generateRefreshToken=function(){
    return jwt.sign(
        {
        _id:this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
)
}


const UserModel=mongoose.models.user || mongoose.model("User",UserScehma);
export default UserModel;

