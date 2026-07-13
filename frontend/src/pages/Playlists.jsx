import { useEffect, useState } from "react"
import { Plus } from "lucide-react"
import { createPlaylist, getUserPlaylists } from "../api/playlist.api.js"
import { getErrorMessage } from "../api/axios.js"
import { useAuth } from "../../context/useAuth.js"
import PlaylistCard from "../components/playlist/PlaylistCard.jsx"
import EmptyState from "../components/common/EmptyState.jsx"
import Loader from "../components/common/Loader.jsx"
import Modal from "../components/common/Modal.jsx"
import Input from "../components/common/Input.jsx"
import Textarea from "../components/common/Textarea.jsx"
import Button from "../components/common/Button.jsx"

const Playlists = () => {
  const { user } = useAuth()
  const [playlists, setPlaylists] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: "", description: "" })
  const [isCreating, setIsCreating] = useState(false)

  const load = () => {
    if (!user) return
    setIsLoading(true)
    getUserPlaylists(user._id)
      .then(({ data }) => setPlaylists(data.data || []))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const handleCreate = async (e) => {
    e.preventDefault()
    setIsCreating(true)
    try {
      await createPlaylist(form)
      setForm({ name: "", description: "" })
      setShowModal(false)
      load()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsCreating(false)
    }
  }

  if (isLoading) return <Loader label="Loading playlists" />

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-display text-lg font-semibold">Your playlists</h1>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={16} /> New playlist
        </Button>
      </div>

      {error ? <p className="mb-4 text-sm text-danger">{error}</p> : null}

      {playlists.length === 0 ? (
        <EmptyState title="No playlists yet" description="Create a playlist to start organizing videos." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {playlists.map((playlist) => (
            <PlaylistCard key={playlist._id} playlist={playlist} />
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New playlist">
        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={3}
            required
          />
          <Button type="submit" isLoading={isCreating} className="w-full">
            Create
          </Button>
        </form>
      </Modal>
    </div>
  )
}

export default Playlists
