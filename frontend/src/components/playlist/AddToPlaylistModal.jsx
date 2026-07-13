import { useEffect, useState } from "react"
import { getUserPlaylists, addVideoToPlaylist } from "../../api/playlist.api.js"
import { useAuth } from "../../context/AuthContext.jsx"
import { getErrorMessage } from "../../api/axios.js"
import Modal from "../common/Modal.jsx"
import Button from "../common/Button.jsx"

const AddToPlaylistModal = ({ isOpen, onClose, videoId }) => {
  const { user } = useAuth()
  const [playlists, setPlaylists] = useState([])
  const [error, setError] = useState("")
  const [addingId, setAddingId] = useState(null)
  const [addedIds, setAddedIds] = useState([])

  useEffect(() => {
    if (!isOpen || !user) return
    getUserPlaylists(user._id)
      .then(({ data }) => setPlaylists(data.data || []))
      .catch((err) => setError(getErrorMessage(err)))
  }, [isOpen, user])

  const handleAdd = async (playlistId) => {
    setAddingId(playlistId)
    try {
      await addVideoToPlaylist(videoId, playlistId)
      setAddedIds((prev) => [...prev, playlistId])
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setAddingId(null)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Save to playlist">
      {error ? <p className="mb-2 text-sm text-danger">{error}</p> : null}
      {playlists.length === 0 ? (
        <p className="text-sm text-muted">You don't have any playlists yet.</p>
      ) : (
        <div className="flex max-h-64 flex-col gap-1 overflow-y-auto">
          {playlists.map((playlist) => (
            <div
              key={playlist._id}
              className="flex items-center justify-between rounded-md px-2 py-2 hover:bg-surface2"
            >
              <span className="truncate text-sm text-cream">{playlist.name}</span>
              <Button
                variant={addedIds.includes(playlist._id) ? "secondary" : "primary"}
                isLoading={addingId === playlist._id}
                onClick={() => handleAdd(playlist._id)}
                disabled={addedIds.includes(playlist._id)}
                className="px-3 py-1 text-xs"
              >
                {addedIds.includes(playlist._id) ? "Added" : "Add"}
              </Button>
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
}

export default AddToPlaylistModal
