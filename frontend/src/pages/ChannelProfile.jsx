import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { getChannelProfile } from "../api/auth.api.js"
import { getAllVideos } from "../api/video.api.js"
import { getUserPlaylists } from "../api/playlist.api.js"
import { getUserTweets } from "../api/tweet.api.js"
import { toggleSubscription } from "../api/subscription.api.js"
import { getErrorMessage } from "../api/axios.js"
import { useAuth } from "../../context/useAuth.js"
import { formatCount } from "../utils/format.js"
import VideoGrid from "../components/video/VideoGrid.jsx"
import PlaylistCard from "../components/playlist/PlaylistCard.jsx"
import TweetCard from "../components/tweet/TweetCard.jsx"
import Loader from "../components/common/Loader.jsx"
import Button from "../components/common/Button.jsx"
import EmptyState from "../components/common/EmptyState.jsx"

const tabs = ["Videos", "Playlists", "Tweets"]

const ChannelProfile = () => {
  const { username } = useParams()
  const { user: currentUser } = useAuth()

  const [channel, setChannel] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("Videos")

  const [videos, setVideos] = useState([])
  const [playlists, setPlaylists] = useState([])
  const [tweets, setTweets] = useState([])

  useEffect(() => {
    setIsLoading(true)
    getChannelProfile(username)
      .then(({ data }) => setChannel(data.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setIsLoading(false))
  }, [username])

  useEffect(() => {
    if (!channel?._id) return
    if (activeTab === "Videos") {
      getAllVideos({ userId: channel._id }).then(({ data }) => setVideos(data.data?.docs || []))
    } else if (activeTab === "Playlists") {
      getUserPlaylists(channel._id).then(({ data }) => setPlaylists(data.data || []))
    } else if (activeTab === "Tweets") {
      getUserTweets(channel._id).then(({ data }) => setTweets(data.data || []))
    }
  }, [activeTab, channel])

  const handleToggleSubscribe = async () => {
    setChannel((prev) => ({
      ...prev,
      isSubscribed: !prev.isSubscribed,
      subscribersCount: prev.isSubscribed ? prev.subscribersCount - 1 : prev.subscribersCount + 1,
    }))
    try {
      await toggleSubscription(channel._id)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  if (isLoading) return <Loader label="Loading channel" />
  if (!channel) return <p className="text-sm text-danger">{error}</p>

  const isOwnChannel = currentUser?._id === channel._id

  return (
    <div>
      <div className="-mx-5 -mt-6 h-40 bg-surface2 sm:h-52">
        {channel.coverImage ? (
          <img src={channel.coverImage} alt="" className="h-full w-full object-cover" />
        ) : null}
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4 pt-4">
        <div className="flex items-center gap-4">
          <img
            src={channel.avatar}
            alt={channel.username}
            className="h-20 w-20 -mt-14 rounded-full border-4 border-ink object-cover"
          />
          <div>
            <h1 className="font-display text-lg font-semibold">{channel.fullName}</h1>
            <p className="text-sm text-muted">
              @{channel.username} · {formatCount(channel.subscribersCount)} subscribers
            </p>
          </div>
        </div>

        {isOwnChannel ? (
          <Link to="/settings">
            <Button variant="secondary">Edit profile</Button>
          </Link>
        ) : (
          <Button variant={channel.isSubscribed ? "secondary" : "primary"} onClick={handleToggleSubscribe}>
            {channel.isSubscribed ? "Subscribed" : "Subscribe"}
          </Button>
        )}
      </div>

      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}

      <div className="mt-6 flex gap-1 border-b border-line">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === tab
                ? "border-b-2 border-amber text-cream"
                : "text-muted hover:text-cream"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {activeTab === "Videos" ? <VideoGrid videos={videos} emptyTitle="No videos yet" /> : null}

        {activeTab === "Playlists" ? (
          playlists.length === 0 ? (
            <EmptyState title="No playlists yet" />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {playlists.map((playlist) => (
                <PlaylistCard key={playlist._id} playlist={playlist} />
              ))}
            </div>
          )
        ) : null}

        {activeTab === "Tweets" ? (
          tweets.length === 0 ? (
            <EmptyState title="No tweets yet" />
          ) : (
            <div className="mx-auto flex max-w-xl flex-col gap-3">
              {tweets.map((tweet) => (
                <TweetCard key={tweet._id} tweet={tweet} onUpdate={() => {}} onDelete={() => {}} onToggleLike={() => {}} />
              ))}
            </div>
          )
        ) : null}
      </div>
    </div>
  )
}

export default ChannelProfile
