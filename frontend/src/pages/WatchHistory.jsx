import { useEffect, useState } from "react"
import { getWatchHistory } from "../api/auth.api.js"
import { getErrorMessage } from "../api/axios.js"
import VideoGrid from "../components/video/VideoGrid.jsx"
import Loader from "../components/common/Loader.jsx"

const WatchHistory = () => {
  const [videos, setVideos] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    getWatchHistory()
      .then(({ data }) => setVideos(data.data || []))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) return <Loader label="Loading watch history" />

  return (
    <div>
      <h1 className="mb-5 font-display text-lg font-semibold">Watch history</h1>
      {error ? <p className="mb-4 text-sm text-danger">{error}</p> : null}
      <VideoGrid videos={videos} emptyTitle="No watch history" emptyDescription="Videos you watch will show up here." />
    </div>
  )
}

export default WatchHistory
