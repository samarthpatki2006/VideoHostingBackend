import { NavLink } from "react-router-dom"
import {
  Clapperboard,
  Compass,
  History,
  LayoutDashboard,
  ListVideo,
  MessageSquareText,
  ThumbsUp,
  Users,
} from "lucide-react"
import { useAuth } from "../../context/useAuth.js"

const links = [
  { to: "/", label: "Feed", icon: Compass, end: true },
  { to: "/subscriptions", label: "Subscriptions", icon: Users },
  { to: "/liked-videos", label: "Liked videos", icon: ThumbsUp },
  { to: "/history", label: "Watch history", icon: History },
  { to: "/playlists", label: "Playlists", icon: ListVideo },
  { to: "/tweets", label: "Tweets", icon: MessageSquareText },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
]

const Sidebar = () => {
  const { user } = useAuth()

  return (
    <aside className="sprocket-rail sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-line bg-surface pr-3 md:flex">
      <div className="flex items-center gap-2 px-5 py-5">
        <Clapperboard className="text-amber" size={22} />
        <span className="font-display text-lg font-semibold tracking-tight">Kinescope</span>
      </div>

      <nav className="flex flex-col gap-1 px-3">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-surface2 text-amber"
                  : "text-muted hover:bg-surface2 hover:text-cream"
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {user ? (
        <NavLink
          to={`/channel/${user.username}`}
          className="mt-auto mb-5 flex items-center gap-2 rounded-md px-5 py-3 text-sm text-muted hover:text-cream"
        >
          <img
            src={user.avatar}
            alt={user.username}
            className="h-7 w-7 rounded-full border border-line object-cover"
          />
          <span className="truncate">Your channel</span>
        </NavLink>
      ) : null}
    </aside>
  )
}

export default Sidebar
