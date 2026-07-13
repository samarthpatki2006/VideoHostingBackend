import { api } from "./axios.js"

export const getAllVideos = (params) => api.get("/videos", { params })

export const getVideoById = (videoId) => api.get(`/videos/${videoId}`)

export const publishVideo = (formData, onUploadProgress) =>
  api.post("/videos", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress,
  })

export const updateVideo = (videoId, formData) =>
  api.patch(`/videos/${videoId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })

export const deleteVideo = (videoId) => api.delete(`/videos/${videoId}`)

export const togglePublishStatus = (videoId) =>
  api.patch(`/videos/toggle/publish/${videoId}`)
