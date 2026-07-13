import { useEffect, useState } from "react"
import { Eye, ListVideo, ThumbsUp, Users } from "lucide-react"
import { getChannelStats, getChannelVideos } from "../api/dashboard.api.js"
import { togglePublishStatus, deleteVideo } from "../api/video.api.js"
import { getErrorMessage } from "../api/axios.js"
import { formatCount, timeAgo } from "../utils/format.js"
import Loader from "../components/common/Loader.jsx"
import Button from "../components/common/Button.jsx"
import EmptyState from "../components/common/EmptyState.jsx"
import { Link } from "react-router-dom"

const StatCard = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 rounded-lg border border-line bg-surface p-4">
    <div className="rounded-md bg-surface2 p-2 text-amber">
      <Icon size={18} />
    </div>
    <div>
      <p className="font-mono text-lg text-cream">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  </div>
)

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [videos, setVideos] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const load = async () => {
    setIsLoading(true)
    try {
      const [statsRes, videosRes] = await Promise.all([getChannelStats(), getChannelVideos()])
      setStats(statsRes.data.data)
      setVideos(videosRes.data.data || [])
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleTogglePublish = async (videoId) => {
    try {
      await togglePublishStatus(videoId)
      setVideos((prev) =>
        prev.map((v) => (v._id === videoId ? { ...v, isPublished: !v.isPublished } : v))
      )
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const handleDelete = async (videoId) => {
    if (!window.confirm("Delete this video?")) return
    try {
      await deleteVideo(videoId)
      setVideos((prev) => prev.filter((v) => v._id !== videoId))
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  if (isLoading) return <Loader label="Loading dashboard" />

  return (
    <div>
      <h1 className="mb-5 font-display text-lg font-semibold">Channel dashboard</h1>

      {error ? <p className="mb-4 text-sm text-danger">{error}</p> : null}

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={ListVideo} label="Videos" value={stats?.totalVideos ?? 0} />
        <StatCard icon={Eye} label="Views" value={formatCount(stats?.totalViews ?? 0)} />
        <StatCard icon={ThumbsUp} label="Likes" value={formatCount(stats?.totalLikes ?? 0)} />
        <StatCard icon={Users} label="Subscribers" value={formatCount(stats?.totalSubscribers ?? 0)} />
      </div>

      {videos.length === 0 ? (
        <EmptyState title="No videos yet" description="Upload your first video to see it here." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-line">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Video</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Views</th>
                <th className="px-4 py-3">Likes</th>
                <th className="px-4 py-3">Uploaded</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {videos.map((video) => (
                <tr key={video._id} className="bg-surface/40">
                  <td className="px-4 py-3">
                    <Link to={`/watch/${video._id}`} className="flex items-center gap-3">
                      <img
                        src={video.thumbnail}
                        alt=""
                        className="h-10 w-16 shrink-0 rounded object-cover"
                      />
                      <span className="line-clamp-2 max-w-xs text-cream">{video.title}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleTogglePublish(video._id)}
                      className={`rounded-full px-2.5 py-1 text-xs ${
                        video.isPublished
                          ? "bg-amber/15 text-amber"
                          : "bg-surface2 text-muted"
                      }`}
                    >
                      {video.isPublished ? "Published" : "Unpublished"}
                    </button>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{formatCount(video.views)}</td>
                  <td className="px-4 py-3 font-mono text-xs">{formatCount(video.likesCount ?? 0)}</td>
                  <td className="px-4 py-3 text-xs text-muted">{timeAgo(video.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link to={`/videos/${video._id}/edit`}>
                        <Button variant="secondary" className="px-2.5 py-1 text-xs">
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="danger"
                        className="px-2.5 py-1 text-xs"
                        onClick={() => handleDelete(video._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Dashboard
