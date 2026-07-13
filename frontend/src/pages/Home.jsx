import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { getAllVideos } from "../api/video.api.js"
import { getErrorMessage } from "../api/axios.js"
import VideoGrid from "../components/video/VideoGrid.jsx"
import Loader from "../components/common/Loader.jsx"

const Home = () => {
  const [searchParams] = useSearchParams()
  const query = searchParams.get("query") || ""
  const [videos, setVideos] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    setIsLoading(true)
    getAllVideos({ page: 1, limit: 24, query: query || undefined, sortBy: "createdAt", sortType: "desc" })
      .then(({ data }) => setVideos(data.data?.docs || []))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setIsLoading(false))
  }, [query])

  if (isLoading) return <Loader label="Loading feed" />

  return (
    <div>
      <h1 className="mb-5 font-display text-lg font-semibold">
        {query ? `Results for "${query}"` : "Latest videos"}
      </h1>
      {error ? <p className="mb-4 text-sm text-danger">{error}</p> : null}
      <VideoGrid
        videos={videos}
        emptyTitle="No videos found"
        emptyDescription="Try a different search, or check back once creators start uploading."
      />
    </div>
  )
}

export default Home
