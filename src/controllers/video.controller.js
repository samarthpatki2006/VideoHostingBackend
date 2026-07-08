import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
  //TODO: get all videos based on query, sort, pagination

  const matchStage = {
    isPublished: true
  }

  if (userId) {
    if (!isValidObjectId(userId)) {
      throw new ApiError(400, "Invalid user id")
    }
    matchStage.owner = new mongoose.Types.ObjectId(userId)
  }

  if (query) {
    matchStage.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } }
    ]
  }

  const sortStage = {}
  sortStage[sortBy || "createdAt"] = sortType === "asc" ? 1 : -1

  const videosAggregate = Video.aggregate([
    {
      $match: matchStage
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1
            }
          }
        ]
      }
    },
    {
      $addFields: {
        owner: { $first: "$owner" }
      }
    },
    {
      $sort: sortStage
    }
  ])

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10)
  }

  const videos = await Video.aggregatePaginate(videosAggregate, options)

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"))
})

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body
  // TODO: get video, upload to cloudinary, create video

  if (!title?.trim() || !description?.trim()) {
    throw new ApiError(400, "Title and description are required")
  }

  const videoFileLocalPath = req.files?.videoFile?.[0]?.path
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path

  if (!videoFileLocalPath) {
    throw new ApiError(400, "Video file is required")
  }

  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail is required")
  }

  const videoFile = await uploadOnCloudinary(videoFileLocalPath)
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

  if (!videoFile) {
    throw new ApiError(500, "Failed to upload video file, please try again")
  }

  if (!thumbnail) {
    throw new ApiError(500, "Failed to upload thumbnail, please try again")
  }

  const video = await Video.create({
    title,
    description,
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
    duration: videoFile.duration || 0,
    owner: req.user?._id
  })

  if (!video) {
    throw new ApiError(500, "Failed to publish video, please try again")
  }

  return res
    .status(201)
    .json(new ApiResponse(201, video, "Video published successfully"))
})

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  //TODO: get video by id

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id")
  }

  const video = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId)
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1
            }
          }
        ]
      }
    },
    {
      $addFields: {
        owner: { $first: "$owner" }
      }
    }
  ])

  if (!video?.length) {
    throw new ApiError(404, "Video not found")
  }

  // increment view count and add to logged in user's watch history
  await Video.findByIdAndUpdate(videoId, {
    $inc: { views: 1 }
  })

  if (req.user?._id) {
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { watchHistory: videoId }
    })
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video[0], "Video fetched successfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  //TODO: update video details like title, description, thumbnail

  const { title, description } = req.body

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id")
  }

  const video = await Video.findById(videoId)

  if (!video) {
    throw new ApiError(404, "Video not found")
  }

  if (video.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(400, "Only video owner can edit this video")
  }

  const updateData = {}

  if (title?.trim()) updateData.title = title
  if (description?.trim()) updateData.description = description

  const thumbnailLocalPath = req.file?.path

  if (thumbnailLocalPath) {
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if (!thumbnail) {
      throw new ApiError(500, "Failed to upload thumbnail, please try again")
    }

    updateData.thumbnail = thumbnail.url
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: updateData
    },
    { new: true }
  )

  if (!updatedVideo) {
    throw new ApiError(500, "Failed to update video, please try again")
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video updated successfully"))
})

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  //TODO: delete video

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id")
  }

  const video = await Video.findById(videoId)

  if (!video) {
    throw new ApiError(404, "Video not found")
  }

  if (video.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(400, "Only video owner can delete this video")
  }

  await Video.findByIdAndDelete(videoId)

  return res
    .status(200)
    .json(new ApiResponse(200, { videoId }, "Video deleted successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id")
  }

  const video = await Video.findById(videoId)

  if (!video) {
    throw new ApiError(404, "Video not found")
  }

  if (video.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(400, "Only video owner can toggle publish status")
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        isPublished: !video.isPublished
      }
    },
    { new: true }
  )

  if (!updatedVideo) {
    throw new ApiError(500, "Failed to toggle publish status, please try again")
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedVideo,
        "Video publish status toggled successfully"
      )
    )
})

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus
}