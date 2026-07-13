import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Image as ImageIcon } from "lucide-react"
import { getVideoById, updateVideo } from "../api/video.api.js"
import { getErrorMessage } from "../api/axios.js"
import Input from "../components/common/Input.jsx"
import Textarea from "../components/common/Textarea.jsx"
import Button from "../components/common/Button.jsx"
import Loader from "../components/common/Loader.jsx"

const EditVideo = () => {
  const { videoId } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: "", description: "" })
  const [thumbnail, setThumbnail] = useState(null)
  const [currentThumbnail, setCurrentThumbnail] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    getVideoById(videoId)
      .then(({ data }) => {
        setForm({ title: data.data.title, description: data.data.description })
        setCurrentThumbnail(data.data.thumbnail)
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setIsLoading(false))
  }, [videoId])

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    setError("")
    try {
      const formData = new FormData()
      formData.append("title", form.title)
      formData.append("description", form.description)
      if (thumbnail) formData.append("thumbnail", thumbnail)

      await updateVideo(videoId, formData)
      navigate(`/watch/${videoId}`)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <Loader label="Loading video" />

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-5 font-display text-lg font-semibold">Edit video</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <img
          src={thumbnail ? URL.createObjectURL(thumbnail) : currentThumbnail}
          alt="thumbnail preview"
          className="aspect-video w-full rounded-lg border border-line object-cover"
        />

        <label className="flex cursor-pointer items-center justify-between rounded-md border border-line bg-surface px-3 py-3 text-sm text-muted hover:border-amber">
          <span className="flex items-center gap-2">
            <ImageIcon size={18} /> {thumbnail ? thumbnail.name : "Replace thumbnail (optional)"}
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
          />
        </label>

        <Input label="Title" name="title" value={form.title} onChange={handleChange} required />
        <Textarea
          label="Description"
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={4}
          required
        />

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <Button type="submit" isLoading={isSaving}>
          Save changes
        </Button>
      </form>
    </div>
  )
}

export default EditVideo
