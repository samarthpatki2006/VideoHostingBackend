import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { getSubscribedChannels } from "../api/subscription.api.js"
import { getErrorMessage } from "../api/axios.js"
import { useAuth } from "../../context/useAuth.js"
import EmptyState from "../components/common/EmptyState.jsx"
import Loader from "../components/common/Loader.jsx"

const Subscriptions = () => {
  const { user } = useAuth()
  const [channels, setChannels] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!user) return
    getSubscribedChannels(user._id)
      .then(({ data }) => setChannels(data.data || []))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setIsLoading(false))
  }, [user])

  if (isLoading) return <Loader label="Loading subscriptions" />

  return (
    <div>
      <h1 className="mb-5 font-display text-lg font-semibold">Subscriptions</h1>
      {error ? <p className="mb-4 text-sm text-danger">{error}</p> : null}

      {channels.length === 0 ? (
        <EmptyState title="No subscriptions yet" description="Channels you subscribe to will show up here." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {channels.map((channel) => (
            <Link
              key={channel._id}
              to={`/channel/${channel.username}`}
              className="flex items-center gap-3 rounded-lg border border-line bg-surface p-4 hover:border-amber"
            >
              <img
                src={channel.avatar}
                alt={channel.username}
                className="h-11 w-11 rounded-full border border-line object-cover"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-cream">{channel.fullName}</p>
                <p className="truncate text-xs text-muted">@{channel.username}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default Subscriptions
