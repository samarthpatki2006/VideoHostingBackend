import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Clapperboard } from "lucide-react"
import { useAuth } from "../../context/useAuth.js"
import { getErrorMessage } from "../api/axios.js"
import Input from "../components/common/Input.jsx"
import Button from "../components/common/Button.jsx"

const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ identifier: "", password: "" })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    try {
      const isEmail = form.identifier.includes("@")
      await login({
        [isEmail ? "email" : "username"]: form.identifier,
        password: form.password,
      })
      navigate("/")
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm rounded-lg border border-line bg-surface p-6">
        <div className="mb-6 flex flex-col items-center gap-2">
          <Clapperboard className="text-amber" size={28} />
          <h1 className="font-display text-xl font-semibold">Sign in to Kinescope</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Username or email"
            name="identifier"
            value={form.identifier}
            onChange={handleChange}
            required
          />
          <Input
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />

          {error ? <p className="text-sm text-danger">{error}</p> : null}

          <Button type="submit" isLoading={isLoading} className="w-full">
            Sign in
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          New here?{" "}
          <Link to="/register" className="text-amber hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
