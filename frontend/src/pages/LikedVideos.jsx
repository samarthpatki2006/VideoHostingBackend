import { useEffect, useState } from "react"
import { getLikedVideos } from "../api/like.api.js"
import { getErrorMessage } from "../api/axios.js"
import VideoGrid from "../components/video/VideoGrid.jsx"
import Loader from "../components/common/Loader.jsx"

const LikedVideos = () => {
  const [videos, setVideos] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    getLikedVideos()
      .then(({ data }) => setVideos((data.data || []).map((entry) => entry.video)))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) return <Loader label="Loading liked videos" />

  return (
    <div>
      <h1 className="mb-5 font-display text-lg font-semibold">Liked videos</h1>
      {error ? <p className="mb-4 text-sm text-danger">{error}</p> : null}
      <VideoGrid videos={videos} emptyTitle="No liked videos" emptyDescription="Videos you like will show up here." />
    </div>
  )
}

export default LikedVideos
