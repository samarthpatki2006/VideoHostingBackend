import { api } from "./axios.js"

// NOTE: these endpoints assume a standard users.routes.js (register/login/logout/
// refresh-token/change-password/current-user/update-account/avatar/cover-image/
// c/:username/history) alongside the routes we built together. Adjust paths here
// if your actual user routes differ.

export const registerUser = (formData) =>
  api.post("/users/register", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })

export const loginUser = (credentials) => api.post("/users/login", credentials)

export const logoutUser = () => api.post("/users/logout")

export const getCurrentUser = () => api.get("/users/current-user")

export const changePassword = (payload) =>
  api.post("/users/change-password", payload)

export const updateAccount = (payload) =>
  api.patch("/users/update-account", payload)

export const updateAvatar = (file) => {
  const formData = new FormData()
  formData.append("avatar", file)
  return api.patch("/users/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
}

export const updateCoverImage = (file) => {
  const formData = new FormData()
  formData.append("coverImage", file)
  return api.patch("/users/cover-image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
}

export const getChannelProfile = (username) => api.get(`/users/c/${username}`)

export const getWatchHistory = () => api.get("/users/history")
