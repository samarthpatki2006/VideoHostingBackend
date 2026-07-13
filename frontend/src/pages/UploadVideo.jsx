import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { FileVideo, Image as ImageIcon } from "lucide-react"
import { publishVideo } from "../api/video.api.js"
import { getErrorMessage } from "../api/axios.js"
import Input from "../components/common/Input.jsx"
import Textarea from "../components/common/Textarea.jsx"
import Button from "../components/common/Button.jsx"

const UploadVideo = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: "", description: "" })
  const [videoFile, setVideoFile] = useState(null)
  const [thumbnail, setThumbnail] = useState(null)
  const [progress, setProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!videoFile || !thumbnail) {
      setError("Please choose both a video file and a thumbnail")
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("title", form.title)
      formData.append("description", form.description)
      formData.append("videoFile", videoFile)
      formData.append("thumbnail", thumbnail)

      const { data } = await publishVideo(formData, (evt) => {
        setProgress(Math.round((evt.loaded * 100) / evt.total))
      })

      navigate(`/watch/${data.data._id}`)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-5 font-display text-lg font-semibold">Upload a video</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex cursor-pointer items-center justify-between rounded-md border border-line bg-surface px-3 py-3 text-sm text-muted hover:border-amber">
          <span className="flex items-center gap-2">
            <FileVideo size={18} /> {videoFile ? videoFile.name : "Choose video file"}
          </span>
          <input
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
          />
        </label>

        <label className="flex cursor-pointer items-center justify-between rounded-md border border-line bg-surface px-3 py-3 text-sm text-muted hover:border-amber">
          <span className="flex items-center gap-2">
            <ImageIcon size={18} /> {thumbnail ? thumbnail.name : "Choose thumbnail"}
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

        {isUploading ? (
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface2">
            <div
              className="h-full bg-amber transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        ) : null}

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <Button type="submit" isLoading={isUploading}>
          Publish
        </Button>
      </form>
    </div>
  )
}

export default UploadVideo
