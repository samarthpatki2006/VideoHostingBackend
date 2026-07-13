import VideoCard from "./VideoCard.jsx"
import EmptyState from "../common/EmptyState.jsx"

const VideoGrid = ({ videos, emptyTitle = "No videos yet", emptyDescription }) => {
  if (!videos?.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  }

  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {videos.map((video) => (
        <VideoCard key={video._id} video={video} />
      ))}
    </div>
  )
}

export default VideoGrid
