import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import {User} from '../models/user.model.js';
import {ApiResponse} from '../utils/ApiResponse.js';
import {uploadOnCloudinary} from '../utils/cloudinary.js';
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens=async function(userId){ // to generate both in single method
  try{
    const user=await User.findById(userId);
    const accessToken=user.generateAccessToken()
    const refreshToken=user.generateRefreshToken()
    user.refreshToken=refreshToken; // we r saving only refresh token bcoz thn we will not ask user to validate again and again we will match ref toke which we give to user and in our db
    await user.save({validateBeforeSave:false}) // bcoz we r saving only one fiels but in moongoose model many fields are there and some r required

    return {accessToken,refreshToken}
  }
  catch(error){
    console.error(error)
    throw new ApiError(500,"Something went wrong while generating access and refresh tokens")
  }
}

const registerUser=asyncHandler(async(req,res)=>{
  // get user details from frontend
  // validation- not empty
  // check if user already exists: username,email
  // check for images avatar (req)
  // upload to cloudinary and check if uploaded 
  // create user object -create entry in db
  // remove pass and refresh token in the response
  // check for user creation if created send res

  const { fullName,email,username,password }=req.body
  if([fullName,email,username,password].some((field)=>{
    field?.trim===""
  })){
    throw new ApiError(400,"All fields are required")
  }

  const existedUser=await User.findOne({
    $or:[{username},{email}]
  })

  if(existedUser){
    throw new ApiError(400,"User with email or username already exists")
  }
  let avatarLocalPath;
  let coverImageLocalPath;
  if(req.files){
    if(req.files.avatar){
      avatarLocalPath=req.files.avatar[0].path
    }
    if(req.files.coverImage){
      coverImageLocalPath=req.files.coverImage[0].path 
    }
  }
  console.log(avatarLocalPath)
  if(!avatarLocalPath){
    throw new ApiError(400,"Avatar file is required")
  }

  const avatar=await uploadOnCloudinary(avatarLocalPath)
  const coverImage=await uploadOnCloudinary(coverImageLocalPath)
  console.log(avatar)
  if(!avatar){
    throw new ApiError(400,"Avatar file is required")
  }

  const user=await User.create({
    fullName,
    email,
    avatar:avatar.url,
    coverImage:coverImage?.url || "",
    password,
    username:username.toLowerCase()
  })

  const createdUser=await User.findById(user._id).select(
    "-password -refreshToken"
  )

  if(!createdUser){
    throw new ApiError(500,"Something went wrong while registering the user")
  }

  res.status(200).json(
    new ApiResponse(200,createdUser,"User registered successfully")
  )
})

const loginUser=asyncHandler(async(req,res)=>{
  //req body => data
  // validate thru email or username
  //find the user if not present throw err
  // passworrd check
  //access and refresh token
  // send tokens via cookie

  const {email,username,password}=req.body
  if(!(username || email)){
    throw new ApiError(400,"Username or Email is required")
  }
  const user=await User.findOne({
    $or:[{ username },{ email }]
  })

  if(!user){
    throw new ApiError(404,"User does not exist")
  }

  const isPasswordValid=await user.isPasswordCorrect(password) //methods tht we have added r available in User model instance where as in built methods r in User model or db
  if(!isPasswordValid){
    throw new ApiError(404,"Invalid user credentials")
  }

  const{accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id)

  const loggedInUser=await User.findById(user._id).select("-password -refreshToken")
  const options={
    httpOnly:true,
    secure:true,
  }
  
  return res.status(200)
  .cookie("accessToken",accessToken,options) // sending cookie
  .cookie("refreshToken",refreshToken,options)
  .json(
    new ApiResponse(200,{user:loggedInUser,accessToken:accessToken,refreshToken:refreshToken},"User Logged In Successfully")
  ) //sending tokens so tht user may save it 
})

const logoutUser=asyncHandler(async(req,res)=>{
  // clear cookies
  // delete ref token from db
  //req.user can be accssed bcz jwt middle ware runs before this

  User.findByIdAndUpdate(
    await req.user._id,
    {
      $set:{
        refreshToken:undefined
      }
    },
    {
      new:true
    }
  )

  const options={
    httpOnly:true,
    secure:true
  }

  return res
  .status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(new ApiResponse(200,{},"User Logged Out"))
})

const refreshAccessToken=asyncHandler(async(req,res)=>{
  // after some time access token with user expires, then we match the refresh token with user and in our db, then we send new access token to user and create new refresh token and send both to user and db
  // time of access< refresh
  const incommingRefreshToken=req.cookie.refreshToken || req.body.refreshToken

  if(!incommingRefreshToken){
    throw new ApiError(401,"Unauthorized request")
  }
  try {
    const decodedToken=jwt.verify(incommingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
    const user=await User.findById(decodedToken?._id)
    if(!user){
      throw new ApiError(401,"Invalid refresh token")
    }
  
    if(incommingRefreshToken!==user?.refreshToken){
      throw new ApiError(401,"Refresh Token is expired or used")
    }
    const options={
      httpOnly:true,
      secure:true
    }
    const {accessToken,newrefreshToken}=await generateAccessAndRefreshTokens(user._id)
    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newrefreshToken)
    .json(
      new ApiResponse(200,{accessToken,refreshToken:newrefreshToken},"Access token refreshed")
    )
  } catch (error) {
    throw new ApiError(401,error?.message || "Invalid Token")
  }
})

export {registerUser,loginUser,logoutUser,refreshAccessToken}