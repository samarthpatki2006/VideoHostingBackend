import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Clapperboard, UploadCloud } from "lucide-react"
import { useAuth } from "../../context/useAuth.js"
import { getErrorMessage } from "../api/axios.js"
import Input from "../components/common/Input.jsx"
import Button from "../components/common/Button.jsx"

const Register = () => {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: "", email: "", fullName: "", password: "" })
  const [avatar, setAvatar] = useState(null)
  const [coverImage, setCoverImage] = useState(null)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!avatar) {
      setError("Please choose an avatar image")
      return
    }

    setIsLoading(true)
    try {
      const formData = new FormData()
      Object.entries(form).forEach(([key, value]) => formData.append(key, value))
      formData.append("avatar", avatar)
      if (coverImage) formData.append("coverImage", coverImage)

      await register(formData)
      navigate("/login")
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4 py-10">
      <div className="w-full max-w-md rounded-lg border border-line bg-surface p-6">
        <div className="mb-6 flex flex-col items-center gap-2">
          <Clapperboard className="text-amber" size={28} />
          <h1 className="font-display text-xl font-semibold">Create your account</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Full name" name="fullName" value={form.fullName} onChange={handleChange} required />
          <Input label="Username" name="username" value={form.username} onChange={handleChange} required />
          <Input label="Email" type="email" name="email" value={form.email} onChange={handleChange} required />
          <Input
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <label className="flex cursor-pointer items-center justify-between rounded-md border border-line bg-ink px-3 py-2 text-sm text-muted hover:border-amber">
            <span className="flex items-center gap-2">
              <UploadCloud size={16} /> {avatar ? avatar.name : "Upload avatar (required)"}
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setAvatar(e.target.files?.[0] || null)}
            />
          </label>

          <label className="flex cursor-pointer items-center justify-between rounded-md border border-line bg-ink px-3 py-2 text-sm text-muted hover:border-amber">
            <span className="flex items-center gap-2">
              <UploadCloud size={16} /> {coverImage ? coverImage.name : "Upload cover image (optional)"}
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
            />
          </label>

          {error ? <p className="text-sm text-danger">{error}</p> : null}

          <Button type="submit" isLoading={isLoading} className="w-full">
            Create account
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link to="/login" className="text-amber hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register
