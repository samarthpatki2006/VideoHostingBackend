import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body

  //TODO: create playlist
  if (!name?.trim() || !description?.trim()) {
    throw new ApiError(400, "Name and description are required")
  }

  const playlist = await Playlist.create({
    name,
    description,
    owner: req.user?._id
  })

  if (!playlist) {
    throw new ApiError(500, "Failed to create playlist, please try again")
  }

  return res
    .status(201)
    .json(new ApiResponse(201, playlist, "Playlist created successfully"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params
  //TODO: get user playlists

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user id")
  }

  const playlists = await Playlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId)
      }
    },
    {
      $addFields: {
        videoCount: { $size: "$videos" }
      }
    },
    {
      $sort: {
        createdAt: -1
      }
    }
  ])

  return res
    .status(200)
    .json(new ApiResponse(200, playlists, "User playlists fetched successfully"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params
  //TODO: get playlist by id

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist id")
  }

  const playlist = await Playlist.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(playlistId)
      }
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
        pipeline: [
          {
            $match: {
              isPublished: true
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
        ]
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
        owner: { $first: "$owner" },
        videoCount: { $size: "$videos" }
      }
    }
  ])

  if (!playlist?.length) {
    throw new ApiError(404, "Playlist not found")
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist[0], "Playlist fetched successfully"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params

  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid playlist or video id")
  }

  const playlist = await Playlist.findById(playlistId)

  if (!playlist) {
    throw new ApiError(404, "Playlist not found")
  }

  if (playlist.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(400, "Only playlist owner can add videos to it")
  }

  if (playlist.videos.some((v) => v.toString() === videoId)) {
    throw new ApiError(400, "Video already in playlist")
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $addToSet: {
        videos: videoId
      }
    },
    { new: true }
  )

  if (!updatedPlaylist) {
    throw new ApiError(500, "Failed to add video to playlist, please try again")
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedPlaylist, "Video added to playlist successfully")
    )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params
  // TODO: remove video from playlist

  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid playlist or video id")
  }

  const playlist = await Playlist.findById(playlistId)

  if (!playlist) {
    throw new ApiError(404, "Playlist not found")
  }

  if (playlist.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(400, "Only playlist owner can remove videos from it")
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: {
        videos: videoId
      }
    },
    { new: true }
  )

  if (!updatedPlaylist) {
    throw new ApiError(500, "Failed to remove video from playlist, please try again")
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedPlaylist,
        "Video removed from playlist successfully"
      )
    )
})

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params
  // TODO: delete playlist

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist id")
  }

  const playlist = await Playlist.findById(playlistId)

  if (!playlist) {
    throw new ApiError(404, "Playlist not found")
  }

  if (playlist.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(400, "Only playlist owner can delete it")
  }

  await Playlist.findByIdAndDelete(playlistId)

  return res
    .status(200)
    .json(new ApiResponse(200, { playlistId }, "Playlist deleted successfully"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params
  const { name, description } = req.body
  //TODO: update playlist

  if (!name?.trim() || !description?.trim()) {
    throw new ApiError(400, "Name and description are required")
  }

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist id")
  }

  const playlist = await Playlist.findById(playlistId)

  if (!playlist) {
    throw new ApiError(404, "Playlist not found")
  }

  if (playlist.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(400, "Only playlist owner can edit it")
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name,
        description
      }
    },
    { new: true }
  )

  if (!updatedPlaylist) {
    throw new ApiError(500, "Failed to update playlist, please try again")
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist, "Playlist updated successfully"))
})

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist
}