import { useState } from "react"
import { Heart, Pencil, Trash2 } from "lucide-react"
import { timeAgo } from "../../utils/format.js"
import { useAuth } from "../../context/AuthContext.jsx"
import Textarea from "../common/Textarea.jsx"
import Button from "../common/Button.jsx"

const TweetCard = ({ tweet, onUpdate, onDelete, onToggleLike }) => {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState(tweet.content)
  const [isSaving, setIsSaving] = useState(false)

  const isOwner = user?._id === tweet.owner?._id || user?._id === tweet.owner

  const handleSave = async () => {
    if (!content.trim()) return
    setIsSaving(true)
    try {
      await onUpdate(tweet._id, content.trim())
      setIsEditing(false)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <div className="flex items-center gap-2">
        {user?.avatar ? (
          <img src={user.avatar} alt="" className="h-8 w-8 rounded-full border border-line object-cover" />
        ) : null}
        <span className="text-xs text-muted">{timeAgo(tweet.createdAt)}</span>
      </div>

      {isEditing ? (
        <div className="mt-2 flex flex-col gap-2">
          <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={2} />
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
        <p className="mt-2 whitespace-pre-wrap text-sm text-cream/90">{tweet.content}</p>
      )}

      {!isEditing ? (
        <div className="mt-3 flex items-center gap-4">
          <button
            onClick={() => onToggleLike(tweet._id)}
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
                onClick={() => onDelete(tweet._id)}
                className="flex items-center gap-1 text-xs text-muted hover:text-danger"
              >
                <Trash2 size={14} /> Delete
              </button>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export default TweetCard
