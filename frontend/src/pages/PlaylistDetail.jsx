import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Pencil, Trash2, X } from "lucide-react"
import {
  deletePlaylist,
  getPlaylistById,
  removeVideoFromPlaylist,
  updatePlaylist,
} from "../api/playlist.api.js"
import { getErrorMessage } from "../api/axios.js"
import { useAuth } from "../../context/useAuth.js"
import VideoCard from "../components/video/VideoCard.jsx"
import EmptyState from "../components/common/EmptyState.jsx"
import Loader from "../components/common/Loader.jsx"
import Button from "../components/common/Button.jsx"
import Input from "../components/common/Input.jsx"
import Textarea from "../components/common/Textarea.jsx"

const PlaylistDetail = () => {
  const { playlistId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [playlist, setPlaylist] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({ name: "", description: "" })

  const load = () => {
    setIsLoading(true)
    getPlaylistById(playlistId)
      .then(({ data }) => {
        setPlaylist(data.data)
        setForm({ name: data.data.name, description: data.data.description })
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playlistId])

  const isOwner = user?._id === playlist?.owner?._id || user?._id === playlist?.owner

  const handleRemoveVideo = async (videoId) => {
    try {
      await removeVideoFromPlaylist(videoId, playlistId)
      setPlaylist((prev) => ({
        ...prev,
        videos: prev.videos.filter((v) => v._id !== videoId),
      }))
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      const { data } = await updatePlaylist(playlistId, form)
      setPlaylist((prev) => ({ ...prev, ...data.data }))
      setIsEditing(false)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const handleDelete = async () => {
    if (!window.confirm("Delete this playlist?")) return
    try {
      await deletePlaylist(playlistId)
      navigate("/playlists")
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  if (isLoading) return <Loader label="Loading playlist" />
  if (!playlist) return <p className="text-sm text-danger">{error}</p>

  return (
    <div>
      {isEditing ? (
        <form onSubmit={handleUpdate} className="mb-6 flex flex-col gap-3 rounded-lg border border-line bg-surface p-4">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={2}
          />
          <div className="flex gap-2">
            <Button type="submit">Save</Button>
            <Button variant="ghost" type="button" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="font-display text-lg font-semibold">{playlist.name}</h1>
            <p className="mt-1 text-sm text-muted">{playlist.description}</p>
          </div>
          {isOwner ? (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setIsEditing(true)}>
                <Pencil size={15} /> Edit
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                <Trash2 size={15} /> Delete
              </Button>
            </div>
          ) : null}
        </div>
      )}

      {error ? <p className="mb-4 text-sm text-danger">{error}</p> : null}

      {!playlist.videos?.length ? (
        <EmptyState title="No videos in this playlist" description="Add videos from the watch page." />
      ) : (
        <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {playlist.videos.map((video) => (
            <div key={video._id} className="relative">
              <VideoCard video={video} />
              {isOwner ? (
                <button
                  onClick={() => handleRemoveVideo(video._id)}
                  className="absolute right-1 top-1 rounded-full bg-ink/80 p-1 text-cream hover:text-danger"
                  title="Remove from playlist"
                >
                  <X size={14} />
                </button>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PlaylistDetail
