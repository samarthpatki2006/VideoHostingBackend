import { Link } from "react-router-dom"
import { ListVideo } from "lucide-react"

const PlaylistCard = ({ playlist }) => {
  return (
    <Link
      to={`/playlists/${playlist._id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-line bg-surface transition-colors hover:border-amber"
    >
      <div className="relative flex aspect-video items-center justify-center bg-surface2">
        {playlist.videos?.[0]?.thumbnail ? (
          <img
            src={playlist.videos[0].thumbnail}
            alt={playlist.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <ListVideo className="text-muted" size={28} />
        )}
        <span className="absolute bottom-1.5 right-1.5 rounded bg-ink/85 px-1.5 py-0.5 font-mono text-[11px] text-cream">
          {playlist.videoCount ?? playlist.videos?.length ?? 0} videos
        </span>
      </div>
      <div className="p-3">
        <p className="truncate font-display text-sm font-medium text-cream">{playlist.name}</p>
        <p className="line-clamp-2 text-xs text-muted">{playlist.description}</p>
      </div>
    </Link>
  )
}

export default PlaylistCard
