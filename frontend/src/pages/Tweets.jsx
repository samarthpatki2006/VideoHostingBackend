import { useEffect, useState } from "react"
import { createTweet, deleteTweet, getUserTweets, updateTweet } from "../api/tweet.api.js"
import { toggleTweetLike } from "../api/like.api.js"
import { getErrorMessage } from "../api/axios.js"
import { useAuth } from "../../context/useAuth.js"
import TweetComposer from "../components/tweet/TweetComposer.jsx"
import TweetCard from "../components/tweet/TweetCard.jsx"
import EmptyState from "../components/common/EmptyState.jsx"
import Loader from "../components/common/Loader.jsx"

const Tweets = () => {
  const { user } = useAuth()
  const [tweets, setTweets] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const load = () => {
    if (!user) return
    setIsLoading(true)
    getUserTweets(user._id)
      .then(({ data }) => setTweets(data.data || []))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const handleCreate = async (content) => {
    const { data } = await createTweet(content)
    setTweets((prev) => [data.data, ...prev])
  }

  const handleUpdate = async (tweetId, content) => {
    const { data } = await updateTweet(tweetId, content)
    setTweets((prev) => prev.map((t) => (t._id === tweetId ? data.data : t)))
  }

  const handleDelete = async (tweetId) => {
    await deleteTweet(tweetId)
    setTweets((prev) => prev.filter((t) => t._id !== tweetId))
  }

  const handleToggleLike = async (tweetId) => {
    await toggleTweetLike(tweetId)
  }

  if (isLoading) return <Loader label="Loading tweets" />

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-5 font-display text-lg font-semibold">Your tweets</h1>

      <TweetComposer onSubmit={handleCreate} />

      {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}

      <div className="mt-5 flex flex-col gap-3">
        {tweets.length === 0 ? (
          <EmptyState title="No tweets yet" description="Share your first thought above." />
        ) : (
          tweets.map((tweet) => (
            <TweetCard
              key={tweet._id}
              tweet={tweet}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onToggleLike={handleToggleLike}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default Tweets
