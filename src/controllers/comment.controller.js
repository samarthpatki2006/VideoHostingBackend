import mongoose from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  const { page = 1, limit = 10 } = req.query

  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id")
  }

  const aggregate = Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId)
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
        owner: {
          $first: "$owner"
        }
      }
    },
    {
      $sort: {
        createdAt: -1
      }
    }
  ])

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10)
  }

  const comments = await Comment.aggregatePaginate(aggregate, options)

  return res
    .status(200)
    .json(new ApiResponse(200, comments, "Comments fetched successfully"))
})

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params
  const { content } = req.body

  if (!content?.trim()) {
    throw new ApiError(400, "Content is required")
  }

  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id")
  }

  const comment = await Comment.create({
    content,
    video: videoId,
    owner: req.user?._id
  })

  if (!comment) {
    throw new ApiError(500, "Failed to add comment, please try again")
  }

  return res
    .status(201)
    .json(new ApiResponse(201, comment, "Comment added successfully"))
})

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentId } = req.params
  const { content } = req.body

  if (!content?.trim()) {
    throw new ApiError(400, "Content is required")
  }

  if (!mongoose.isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment id")
  }

  const comment = await Comment.findById(commentId)

  if (!comment) {
    throw new ApiError(404, "Comment not found")
  }

  if (comment.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(400, "Only comment owner can edit their comment")
  }

  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content
      }
    },
    { new: true }
  )

  if (!updatedComment) {
    throw new ApiError(500, "Failed to edit comment, please try again")
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "Comment edited successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params

  if (!mongoose.isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment id")
  }

  const comment = await Comment.findById(commentId)

  if (!comment) {
    throw new ApiError(404, "Comment not found")
  }

  if (comment.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(400, "Only comment owner can delete their comment")
  }

  await Comment.findByIdAndDelete(commentId)

  return res
    .status(200)
    .json(new ApiResponse(200, { commentId }, "Comment deleted successfully"))
})

export {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment
}