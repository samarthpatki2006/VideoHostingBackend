import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { LogOut, Search, Upload, User as UserIcon } from "lucide-react"
import { useAuth } from "../../context/useAuth.js"
import Avatar from "../common/Avatar.jsx"

const Navbar = () => {
  const [query, setQuery] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(query.trim() ? `/?query=${encodeURIComponent(query.trim())}` : "/")
  }

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-line bg-ink/95 px-5 py-3 backdrop-blur">
      <form onSubmit={handleSearch} className="flex max-w-lg flex-1 items-center">
        <div className="flex w-full items-center gap-2 rounded-full border border-line bg-surface px-4 py-2">
          <Search size={16} className="text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search videos"
            className="w-full bg-transparent text-sm text-cream placeholder:text-muted/60 focus:outline-none"
          />
        </div>
      </form>

      <div className="ml-auto flex items-center gap-3">
        <button
          onClick={() => navigate("/upload")}
          className="flex items-center gap-2 rounded-md border border-line px-3 py-2 text-sm text-cream hover:border-amber"
        >
          <Upload size={16} />
          <span className="hidden sm:inline">Upload</span>
        </button>

        <div className="relative">
          <button onClick={() => setMenuOpen((v) => !v)}>
            <Avatar src={user?.avatar} alt={user?.username} size="sm" />
          </button>

          {menuOpen ? (
            <div className="absolute right-0 top-11 w-44 rounded-md border border-line bg-surface p-1 shadow-xl">
              <button
                onClick={() => {
                  setMenuOpen(false)
                  navigate(`/channel/${user?.username}`)
                }}
                className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm text-cream hover:bg-surface2"
              >
                <UserIcon size={15} /> Your channel
              </button>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm text-danger hover:bg-surface2"
              >
                <LogOut size={15} /> Log out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}

export default Navbar
