import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { options } from "../constants.js";
import jwt from "jsonwebtoken";
import { Wallet } from "../models/wallet.model.js";


const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false })


    return { accessToken, refreshToken }

  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating refresh and access token")
  }
}

const registerUser = asyncHandler(async (req, res) => {
    const { userName, email, password } = req.body
    
    if(!userName)
    {
        throw new ApiError(400, "Username is required");
    }

    if(!email)
    {
        throw new ApiError(400, "Email is required");
    }
    if(!password)
    {
        throw new ApiError(400, "Password is required");
    }
    
    if(password.length < 6)
    {
        throw new ApiError(400, "Password should be at least 6 characters long");
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(409, "User with entered email already exists");
    }

    const user = await User.create({ userName, email, password });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    
    if(!createdUser) {
        throw new ApiError(500, "Something went wrong while registering user");
    }

    const wallet = await Wallet.create({ 
        userId: createdUser._id,
        balance: {
            USD: 0,
            INR: 0,
            EUR: 0
        } 
    });

    if(!wallet) {
        throw new ApiError(500, "Something went wrong while creating wallet for the registered user");
    }

    return res
        .status(201)
        .json(
            new ApiResponse(201, { user: createdUser }, "User registered successfully")
        )
})

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    if(!email || !password) {
        throw new ApiError(400, "Email and password are required")
    }

    const user = await User.findOne({ email });

    if(!user) {
        throw new ApiError(404, "User not found")
    }

    if (user.isDeleted) {
      throw new Error("User not found or has been soft-deleted");
    }


    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if(!isPasswordCorrect) {
        throw new ApiError(401, "Invalid credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
    
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200,
        {
          user: loggedInUser, accessToken, refreshToken
        },
        "User Logged in Successfully"
      )
    )

})
    
const logoutUser = asyncHandler(async (req, res) => {
    const { user } = req

    if(!user) {
        throw new ApiError(401, "User not found")
    }

    user.refreshToken = null;
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .cookie("accessToken", null, options)
        .cookie("refreshToken", null, options)
        .json(
            new ApiResponse(200, {}, "User logged out successfully")
        )
})

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request")
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    )

    const user = await User.findById(decodedToken?._id)

    if (!user) {
      throw new ApiError(401, "Invalid refresh token")
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used")

    }

    const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id)

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      )
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token")
  }

})

const getUser = asyncHandler(async (req, res) => {
    const { user } = req

    if(!user) {
        throw new ApiError(401, "User not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, { user }, "User fetched successfully")
        )
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);
  if (!user || user.isDeleted) {
    throw new Error("User not found or has been soft-deleted");
  }
  
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid user Password")
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false })

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password change successfully"))

})



export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getUser,
    changeCurrentPassword
}