import {asyncHandler} from "../utility/asyncHandler.js"
import {ApiError} from "../utility/ApiError.js"
import {ApiResponse} from "../utility/ApiResponse.js"
import UserModel from "../models/user.model.js"



const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
        throw new ApiError(400, "All fields are required")
    }

    const existingUser = await UserModel.findOne({
        email: email.toLowerCase()
    })

    if (existingUser) {
        throw new ApiError(409, "User with email already exists")
    }

    const user = await UserModel.create({
        name,
        email: email.toLowerCase(),
        password
    })

    const createdEntry = await UserModel.findById(user._id)
        .select("-password -refreshToken")

    res
        .status(201)
        .json(new ApiResponse(201, createdEntry, "User registered successfully"))
})



const loginUser=asyncHandler(async(req,res)=>{
    const {email,password}=req.body;

    if(!email || !password){
        throw new ApiError(400,"Email & Password are required");
    }

    const user=await UserModel.findOne({email:email.toLowerCase()});

    if(!user){
        throw new ApiError(404,"Invalid user emailid");
    }

    const isPasswordValid=await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(404,"Invalid user password");
    }

    // generating access token and refresh token
    const generateAccessAndRefreshToken=async(userId)=>{
        try {
            const user=await UserModel.findById(userId);
            const accessToken=user.generateAccessToken();
            const refreshToken=user.generateRefreshToken();

            user.refreshToken=refreshToken;
            await user.save({validateBeforeSave:false});

            return {accessToken,refreshToken};
        } catch (error) {
            throw new ApiError(500,"something went wrong while generating tokens");
        }
    };

    const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id);

    const loggedInUser=await UserModel.findById(user._id).select("-password -refreshToken");

    const options={
        httpOnly:true,
        secure:process.env.NODE_ENV==="production",
        sameSite:"strict",
    };

    return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(
            new ApiResponse(
                200,
                {user:loggedInUser},
                "user logged in successfully"
            )
        )
    }
);



const logoutUser=asyncHandler(async(req,res)=>{
    
    // removing refreshToken

    await UserModel.findByIdAndUpdate(
        req.user._id,
        {$unset:{refreshToken:1}},
        {new:true},
    )

    const options={
        httpOnly:true,
        secure:process.env.NODE_ENV==="production",
        sameSite:"Strict",
    }

    // clear auth cookies

    return res
        .status(200)
        .clearCookie("accessToken",options)
        .clearCookie("refreshToken",options)
        .json(
            new ApiResponse(
                200,
                {},
                "User logout successfully"
            )
        )
})

export {registerUser,loginUser,logoutUser};



