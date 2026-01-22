import {asyncHandler} from "../utility/asyncHandler.js"
import {ApiError} from "../utility/ApiError.js"
import {ApiResponse} from "../utility/ApiResponse.js"
import {UserModel} from "../models/user.model.js"



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

export {registerUser}
