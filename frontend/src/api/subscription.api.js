import { api } from "./axios.js"

export const toggleSubscription = (channelId) =>
  api.post(`/subscriptions/c/${channelId}`)

export const getChannelSubscribers = (channelId) =>
  api.get(`/subscriptions/c/${channelId}`)

export const getSubscribedChannels = (subscriberId) =>
  api.get(`/subscriptions/u/${subscriberId}`)
