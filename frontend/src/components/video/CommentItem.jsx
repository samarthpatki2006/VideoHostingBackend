import { useState } from "react"
import { Heart, Pencil, Trash2 } from "lucide-react"
import { useAuth } from "../../context/AuthContext.jsx"
import { timeAgo } from "../../utils/format.js"
import Textarea from "../common/Textarea.jsx"
import Button from "../common/Button.jsx"

const CommentItem = ({ comment, onUpdate, onDelete, onToggleLike }) => {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState(comment.content)
  const [isSaving, setIsSaving] = useState(false)

  const isOwner = user?._id === comment.owner?._id

  const handleSave = async () => {
    if (!content.trim()) return
    setIsSaving(true)
    try {
      await onUpdate(comment._id, content.trim())
      setIsEditing(false)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex gap-3 py-3">
      <img
        src={comment.owner?.avatar}
        alt={comment.owner?.username}
        className="h-9 w-9 shrink-0 rounded-full border border-line object-cover"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-cream">{comment.owner?.username}</span>
          <span className="text-xs text-muted">{timeAgo(comment.createdAt)}</span>
        </div>

        {isEditing ? (
          <div className="mt-2 flex flex-col gap-2">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={2}
            />
            <div className="flex gap-2">
              <Button onClick={handleSave} isLoading={isSaving}>
                Save
              </Button>
              <Button variant="ghost" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="mt-1 whitespace-pre-wrap text-sm text-cream/90">{comment.content}</p>
        )}

        {!isEditing ? (
          <div className="mt-1.5 flex items-center gap-4">
            <button
              onClick={() => onToggleLike(comment._id)}
              className="flex items-center gap-1 text-xs text-muted hover:text-amber"
            >
              <Heart size={14} /> Like
            </button>
            {isOwner ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 text-xs text-muted hover:text-cream"
                >
                  <Pencil size={14} /> Edit
                </button>
                <button
                  onClick={() => onDelete(comment._id)}
                  className="flex items-center gap-1 text-xs text-muted hover:text-danger"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default CommentItem
