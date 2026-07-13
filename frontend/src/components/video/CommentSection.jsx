import { useEffect, useState } from "react"
import {
  addComment,
  deleteComment,
  getVideoComments,
  updateComment,
} from "../../api/comment.api.js"
import { toggleCommentLike } from "../../api/like.api.js"
import { getErrorMessage } from "../../api/axios.js"
import CommentItem from "./CommentItem.jsx"
import Textarea from "../common/Textarea.jsx"
import Button from "../common/Button.jsx"
import Loader from "../common/Loader.jsx"

const CommentSection = ({ videoId }) => {
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isPosting, setIsPosting] = useState(false)
  const [error, setError] = useState("")

  const fetchComments = async () => {
    setIsLoading(true)
    try {
      const { data } = await getVideoComments(videoId, { page: 1, limit: 50 })
      setComments(data.data?.docs || [])
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchComments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    setIsPosting(true)
    try {
      const { data } = await addComment(videoId, newComment.trim())
      setComments((prev) => [data.data, ...prev])
      setNewComment("")
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsPosting(false)
    }
  }

  const handleUpdate = async (commentId, content) => {
    const { data } = await updateComment(commentId, content)
    setComments((prev) => prev.map((c) => (c._id === commentId ? data.data : c)))
  }

  const handleDelete = async (commentId) => {
    await deleteComment(commentId)
    setComments((prev) => prev.filter((c) => c._id !== commentId))
  }

  const handleToggleLike = async (commentId) => {
    await toggleCommentLike(commentId)
  }

  return (
    <div className="mt-6">
      <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-muted">
        {comments.length} Comments
      </h3>

      <form onSubmit={handleAdd} className="mt-3 flex flex-col gap-2">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          rows={2}
        />
        <div>
          <Button type="submit" isLoading={isPosting}>
            Comment
          </Button>
        </div>
      </form>

      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}

      {isLoading ? (
        <Loader label="Loading comments" />
      ) : (
        <div className="mt-2 divide-y divide-line">
          {comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onToggleLike={handleToggleLike}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default CommentSection
