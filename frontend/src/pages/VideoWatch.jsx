import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ListPlus, Pencil, ThumbsUp, Trash2 } from "lucide-react"
import { deleteVideo, getVideoById } from "../api/video.api.js"
import { toggleVideoLike } from "../api/like.api.js"
import { toggleSubscription } from "../api/subscription.api.js"
import { getErrorMessage } from "../api/axios.js"
import { useAuth } from "../../context/useAuth.js"
import { formatCount, timeAgo } from "../utils/format.js"
import CommentSection from "../components/video/CommentSection.jsx"
import AddToPlaylistModal from "../components/playlist/AddToPlaylistModal.jsx"
import Button from "../components/common/Button.jsx"
import Loader from "../components/common/Loader.jsx"

const VideoWatch = () => {
  const { videoId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [video, setVideo] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isLiked, setIsLiked] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [showPlaylistModal, setShowPlaylistModal] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    getVideoById(videoId)
      .then(({ data }) => {
        setVideo(data.data)
        setIsLiked(Boolean(data.data.isLiked))
        setIsSubscribed(Boolean(data.data.owner?.isSubscribed))
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setIsLoading(false))
  }, [videoId])

  const handleToggleLike = async () => {
    setIsLiked((prev) => !prev)
    try {
      await toggleVideoLike(videoId)
    } catch (err) {
      setIsLiked((prev) => !prev)
      setError(getErrorMessage(err))
    }
  }

  const handleToggleSubscribe = async () => {
    if (!video?.owner?._id) return
    setIsSubscribed((prev) => !prev)
    try {
      await toggleSubscription(video.owner._id)
    } catch (err) {
      setIsSubscribed((prev) => !prev)
      setError(getErrorMessage(err))
    }
  }

  const handleDelete = async () => {
    if (!window.confirm("Delete this video? This cannot be undone.")) return
    try {
      await deleteVideo(videoId)
      navigate("/dashboard")
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  if (isLoading) return <Loader label="Loading video" />
  if (error && !video) return <p className="text-sm text-danger">{error}</p>
  if (!video) return null

  const isOwner = user?._id === video.owner?._id

  return (
    <div className="mx-auto max-w-4xl">
      <div className="aspect-video overflow-hidden rounded-lg bg-black">
        <video src={video.videoFile} controls className="h-full w-full" poster={video.thumbnail} />
      </div>

      <h1 className="mt-4 font-display text-xl font-semibold text-cream">{video.title}</h1>
      <p className="mt-1 font-mono text-xs text-muted">
        {formatCount(video.views)} views · {timeAgo(video.createdAt)}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3 border-b border-line pb-4">
        <div className="flex flex-1 items-center gap-3">
          <img
            src={video.owner?.avatar}
            alt={video.owner?.username}
            className="h-11 w-11 rounded-full border border-line object-cover"
          />
          <div>
            <p className="text-sm font-medium text-cream">{video.owner?.fullName}</p>
            <p className="text-xs text-muted">@{video.owner?.username}</p>
          </div>
          {!isOwner ? (
            <Button
              variant={isSubscribed ? "secondary" : "primary"}
              onClick={handleToggleSubscribe}
              className="ml-2"
            >
              {isSubscribed ? "Subscribed" : "Subscribe"}
            </Button>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <Button variant={isLiked ? "secondary" : "ghost"} onClick={handleToggleLike}>
            <ThumbsUp size={16} className={isLiked ? "text-amber" : ""} /> Like
          </Button>
          <Button variant="ghost" onClick={() => setShowPlaylistModal(true)}>
            <ListPlus size={16} /> Save
          </Button>
          {isOwner ? (
            <>
              <Button variant="ghost" onClick={() => navigate(`/videos/${videoId}/edit`)}>
                <Pencil size={16} /> Edit
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                <Trash2 size={16} /> Delete
              </Button>
            </>
          ) : null}
        </div>
      </div>

      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}

      <p className="mt-4 whitespace-pre-wrap text-sm text-cream/90">{video.description}</p>

      <CommentSection videoId={videoId} />

      <AddToPlaylistModal
        isOpen={showPlaylistModal}
        onClose={() => setShowPlaylistModal(false)}
        videoId={videoId}
      />
    </div>
  )
}

export default VideoWatch
