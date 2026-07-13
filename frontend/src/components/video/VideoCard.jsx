import { Link } from "react-router-dom"
import { formatCount, formatDuration, timeAgo } from "../../utils/format.js"

const VideoCard = ({ video }) => {
  if (!video) return null

  return (
    <Link to={`/watch/${video._id}`} className="group flex flex-col gap-2">
      <div className="viewfinder relative aspect-video overflow-hidden rounded-lg bg-surface">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <span className="absolute bottom-1.5 right-1.5 rounded bg-ink/85 px-1.5 py-0.5 font-mono text-[11px] text-cream">
          {formatDuration(video.duration)}
        </span>
      </div>

      <div className="flex gap-2.5">
        {video.owner?.avatar ? (
          <img
            src={video.owner.avatar}
            alt={video.owner.username}
            className="h-9 w-9 shrink-0 rounded-full border border-line object-cover"
          />
        ) : null}
        <div className="min-w-0">
          <p className="line-clamp-2 font-display text-sm font-medium leading-snug text-cream">
            {video.title}
          </p>
          <p className="mt-1 truncate text-xs text-muted">{video.owner?.fullName}</p>
          <p className="font-mono text-[11px] text-muted">
            {formatCount(video.views)} views · {timeAgo(video.createdAt)}
          </p>
        </div>
      </div>
    </Link>
  )
}

export default VideoCard
