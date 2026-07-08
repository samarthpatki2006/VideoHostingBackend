import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async function (userId) { // to generate both in single method
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()
    user.refreshToken = refreshToken; // we r saving only refresh token bcoz thn we will not ask user to validate again and again we will match ref toke which we give to user and in our db
    await user.save({ validateBeforeSave: false }) // bcoz we r saving only one fiels but in moongoose model many fields are there and some r required

    return { accessToken, refreshToken }
  }
  catch (error) {
    console.error(error)
    throw new ApiError(500, "Something went wrong while generating access and refresh tokens")
  }
}

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation- not empty
  // check if user already exists: username,email
  // check for images avatar (req)
  // upload to cloudinary and check if uploaded 
  // create user object -create entry in db
  // remove pass and refresh token in the response
  // check for user creation if created send res

  const { fullName, email, username, password } = req.body
  if ([fullName, email, username, password].some((field) => {
    field?.trim === ""
  })) {
    throw new ApiError(400, "All fields are required")
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }]
  })

  if (existedUser) {
    throw new ApiError(400, "User with email or username already exists")
  }
  let avatarLocalPath;
  let coverImageLocalPath;
  if (req.files) {
    if (req.files.avatar) {
      avatarLocalPath = req.files.avatar[0].path
    }
    if (req.files.coverImage) {
      coverImageLocalPath = req.files.coverImage[0].path
    }
  }
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)
  if (!avatar) {
    throw new ApiError(400, "Avatar file is required")
  }

  const user = await User.create({
    fullName,
    email,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    password,
    username: username.toLowerCase()
  })

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user")
  }

  res.status(200).json(
    new ApiResponse(200, createdUser, "User registered successfully")
  )
})

const loginUser = asyncHandler(async (req, res) => {
  //req body => data
  // validate thru email or username
  //find the user if not present throw err
  // passworrd check
  //access and refresh token
  // send tokens via cookie

  const { email, username, password } = req.body
  if (!(username || email)) {
    throw new ApiError(400, "Username or Email is required")
  }
  const user = await User.findOne({
    $or: [{ username }, { email }]
  })

  if (!user) {
    throw new ApiError(404, "User does not exist")
  }

  const isPasswordValid = await user.isPasswordCorrect(password) //methods tht we have added r available in User model instance where as in built methods r in User model or db
  if (!isPasswordValid) {
    throw new ApiError(404, "Invalid user credentials")
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
  const options = {
    httpOnly: true,
    secure: true,
  }

  return res.status(200)
    .cookie("accessToken", accessToken, options) // sending cookie
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, { user: loggedInUser, accessToken: accessToken, refreshToken: refreshToken }, "User Logged In Successfully")
    ) //sending tokens so tht user may save it 
})

const logoutUser = asyncHandler(async (req, res) => {
  // clear cookies
  // delete ref token from db
  //req.user can be accssed bcz jwt middle ware runs before this

  await User.findByIdAndUpdate(
    await req.user._id,
    {
      $set: {
        refreshToken: undefined
      }
    },
    {
      new: true
    }
  )

  const options = {
    httpOnly: true,
    secure: true
  }

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
  // after some time access token with user expires, then we match the refresh token with user and in our db, then we send new access token to user and create new refresh token and send both to user and db
  // time of access< refresh
  const incommingRefreshToken = req.cookie.refreshToken || req.body.refreshToken

  if (!incommingRefreshToken) {
    throw new ApiError(401, "Unauthorized request")
  }
  try {
    const decodedToken = jwt.verify(incommingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    //we need to decode the token to extract he info saved in it
    const user = await User.findById(decodedToken?._id)
    if (!user) {
      throw new ApiError(401, "Invalid refresh token")
    }

    if (incommingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh Token is expired or used")
    }
    const options = {
      httpOnly: true,
      secure: true
    }
    const { accessToken, newrefreshToken } = await generateAccessAndRefreshTokens(user._id)
    return res.status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newrefreshToken)
      .json(
        new ApiResponse(200, { accessToken, refreshToken: newrefreshToken }, "Access token refreshed")
      )
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Token")
  }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body
  const user = User.findById(req?.user._id)
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old Password")
  }
  user.password = newPassword
  await user.save({ validateBeforeSave: false })
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json(200, req.user, "Current user fetched successfully")
})

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body
  if (!fullName || !email) {
    throw new ApiError(400, "All the fields are mandatory")
  }
  const user = User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName: fullName,
        email: email
      }
    },
    {
      new: true
    }
  ).select("-password")
  return res
    .status(200)
    .json(200, user, "Account Details Updated Successfully")
})

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing")
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath)

  if (!avatar) {
    throw new ApiError(400, "Error while uploading avatar on cloudinary")
  }
  const user = await User.findByIdAndDelete(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url
      }
    }, {
    new: true
  }
  ).select("-password")

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar Updated Successfully"))
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path
  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover Image file is missing")
  }
  const coverImage = await uploadOnCloudinary(avatarLocalPath)

  if (!coverImage) {
    throw new ApiError(400, "Error while uploading Cover Image on cloudinary")
  }
  const user = await User.findByIdAndDelete(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url
      }
    }, {
    new: true
  }
  ).select("-password")

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover Image Updated Successfully"))
})

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params
  if (!username?.toLowerCase()) {
    throw new ApiError(400, "Username is missing")
  }
  await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase()
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers"
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo"
      }
    },
    {
      $addFields: {
        subscriberCount: {
          $size: "$subscribers"
        },
        channelsSubscribedTo: {
          $size: "$subscribedTo"
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false
          }
        }
      }
    }
  ])
})

const getWatchHistory = asyncHandler(async(req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "Watch history fetched successfully"
        )
    )
})

export { registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getUserChannelProfile,getWatchHistory }