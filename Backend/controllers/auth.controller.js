import {asyncHandler} from "../utility/asyncHandler.js"
import {ApiError} from "../utility/ApiError.js"
import {ApiResponse} from "../utility/ApiResponse.js"
import UserModel from "../models/user.model.js"
import transporter from "../config/nodeMailer.config.js"
import bcrypt from "bcryptjs"



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

        // ****sending welcome email when first registered of user//

    const sendingEmailOptions={
        from:process.env.SENDER_EMAIL,
        to:email,
        subject:"Welcome to Our website",
        text:`Welcome to our website. Your account has been created with email id :${email}`
    }

    try {
        await transporter.sendMail(sendingEmailOptions);
    } catch (error) {
        console.err("Email failed",error.message);
    }
    
    res
        .status(201)
        .json(new ApiResponse(201, createdEntry, "User registered successfully"))
})

// **********************************login user***************************

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

//  *************************logout*******************************************

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
        sameSite:"strict",
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


// **************************sending otp ****************************************

const sendVerifyOTP= asyncHandler(async(req,res)=>{
    const userId=req.user?._id;

    if(!userId){
        throw new ApiError(401,"unauthorized reques");
    }

    const user=await UserModel.findById(userId).select("+verifyOtp +verifyOtpExpireAt");

    if(!user){
        throw new ApiError(404,"User not found");
    }

    if(user.isAccountVerified){
        throw new ApiError(400,"Account already verified");
    }

    const otp=Math.floor(100000 + Math.random() * 900000).toString();

    const hashedOtp=await bcrypt.hash(otp,10);

    user.verifyOtp=hashedOtp;
    user.verifyOtpExpireAt=new Date(Date.now() + 10 * 60 * 1000);

    await user.save({validateBeforeSave:false});



    const sendingEmailOptions={
        from:process.env.SENDER_EMAIL,
        to:user.email,
        subject:"Account verification OTP",
        text:`Your otp is ${otp}. Verify your account using this otp. It expires in 10 minutes`
    };

    try {
        await transporter.sendMail(sendingEmailOptions);
    } catch (error) {
        console.err("Email failed",error.message);
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200,
                {},
                "Verification otp send to email"
            )
        );

});


// **************************verifying otp ****************************************

const verifyEmailOtp=asyncHandler(async(req,res)=>{

    const userId=req.user?._id;
    const {otp} =req.body;

    if(!otp){
        throw new ApiError(400,"otp is required");
    }

    const user=await UserModel.findById(userId).select("+verifyOtp +verifyOtpExpireAt");

    if(!user){
        throw new ApiError(404,"User not found");
    }

    if(user.isAccountVerified){
        throw new ApiError(400,"Account already verified");
    }

    if(!user.verifyOtp || !user.verifyOtpExpireAt){
        throw new ApiError(400,"No otp request found");
    }

    if(user.verifyOtpExpireAt < Date.now()){
        throw new ApiError(400,"OTP has expired")
    }


    const isOtpValid=await bcrypt.compare(otp,user.verifyOtp);

    if(!isOtpValid){
        throw new ApiError(400,"Invalid Otp");
    }

    user.isAccountVerified=true;
    user.verifyOtp=undefined;
    user.verifyOtpExpireAt=undefined;

    await user.save({validateBeforeSave:false});

    return res.
    status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Email verified successfully")
    );

    })

// ********* to check if isAuthenticate******************

const userIfAuthenticate=async(req,res)=>{
    try {
        return res
            .json(200,"User is verified")
    } catch (error) {
        return res
            .json(400,"Account is not register")
    }
}


// ***************** send password otp ************************

const sendPasswordResetOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    const normalizedEmail = email.toLowerCase();

    const user = await UserModel.findOne({ email: normalizedEmail });

    // Always return same response to prevent email enumeration
    if (!user) {
        return res.json(
            new ApiResponse(200, {}, "If the email exists, OTP sent")
        );
    }

    const COOLDOWN_TIME = 60 * 1000; // 1 minute cooldown

    if (
        user.passwordResetRequestedAt &&
        Date.now() - user.passwordResetRequestedAt < COOLDOWN_TIME
    ) {
        throw new ApiError(429, "Please wait before requesting another OTP");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    user.resetOtp = hashedOtp;
    user.resetOtpExpireAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry
    user.passwordResetRequestedAt = Date.now(); // ✅ FIXED (store request time)

    await user.save({ validateBeforeSave: false });

    const sendingEmailOptions = {
        from: process.env.SENDER_EMAIL,
        to: normalizedEmail,
        subject: "Password reset OTP",
        text: `Your password reset OTP is ${otp}. It expires in 10 minutes.`,
    };

    try {
        await transporter.sendMail(sendingEmailOptions);
    } catch (error) {
        // Cleanup if email fails
        user.resetOtp = undefined;
        user.resetOtpExpireAt = undefined;
        user.passwordResetRequestedAt = undefined;
        await user.save({ validateBeforeSave: false });

        throw new ApiError(500, "Failed to send reset OTP email");
    }

    return res.json(
        new ApiResponse(200, {}, "If the email exists, OTP sent")
    );
});

const resetPasswordVerify = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        throw new ApiError(400, "Email, OTP, and new password are required");
    }

    const normalizedEmail = email.toLowerCase();
    const user = await UserModel.findOne({ email: normalizedEmail });

    if (!user || !user.resetOtp || !user.resetOtpExpireAt) {
        return res.status(400).json(
            new ApiResponse(400, {}, "Invalid or expired OTP")
        );
    }

    if (user.resetOtpExpireAt < Date.now()) {
        throw new ApiError(400, "OTP has expired");
    }

    const isOtpValid = await bcrypt.compare(otp, user.resetOtp);

    if (!isOtpValid) {
        throw new ApiError(400, "Invalid OTP");
    }

    // Update password
    user.password = newPassword;

    // Security cleanup
    user.resetOtp = undefined;
    user.resetOtpExpireAt = undefined;
    user.passwordResetRequestedAt = undefined;
    user.refreshToken = undefined; // force logout everywhere

    await user.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, {}, "Password changed successfully")
    );
});


export {registerUser,loginUser,logoutUser,sendVerifyOTP,verifyEmailOtp,userIfAuthenticate,sendPasswordResetOtp,resetPasswordVerify};



