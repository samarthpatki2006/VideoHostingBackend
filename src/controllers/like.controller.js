import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  //TODO: toggle like on video

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id")
  }

  const existingLike = await Like.findOne({
    video: videoId,
    likedBy: req.user?._id
  })

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id)

    return res
      .status(200)
      .json(new ApiResponse(200, { liked: false }, "Video unliked successfully"))
  }

  const like = await Like.create({
    video: videoId,
    likedBy: req.user?._id
  })

  if (!like) {
    throw new ApiError(500, "Failed to like video, please try again")
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { liked: true }, "Video liked successfully"))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params
  //TODO: toggle like on comment

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment id")
  }

  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: req.user?._id
  })

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id)

    return res
      .status(200)
      .json(new ApiResponse(200, { liked: false }, "Comment unliked successfully"))
  }

  const like = await Like.create({
    comment: commentId,
    likedBy: req.user?._id
  })

  if (!like) {
    throw new ApiError(500, "Failed to like comment, please try again")
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { liked: true }, "Comment liked successfully"))
})

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params
  //TODO: toggle like on tweet

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet id")
  }

  const existingLike = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user?._id
  })

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id)

    return res
      .status(200)
      .json(new ApiResponse(200, { liked: false }, "Tweet unliked successfully"))
  }

  const like = await Like.create({
    tweet: tweetId,
    likedBy: req.user?._id
  })

  if (!like) {
    throw new ApiError(500, "Failed to like tweet, please try again")
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { liked: true }, "Tweet liked successfully"))
})

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos

  const likedVideos = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(req.user?._id),
        video: { $exists: true, $ne: null }
      }
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "video",
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
        ]
      }
    },
    {
      $addFields: {
        video: { $first: "$video" }
      }
    },
    {
      $match: {
        video: { $ne: null }
      }
    },
    {
      $sort: {
        createdAt: -1
      }
    },
    {
      $project: {
        video: 1
      }
    }
  ])

  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
    )
})

export {
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
  getLikedVideos
}