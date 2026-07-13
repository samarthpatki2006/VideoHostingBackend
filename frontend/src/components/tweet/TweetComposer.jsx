import { useState } from "react"
import Textarea from "../common/Textarea.jsx"
import Button from "../common/Button.jsx"

const TweetComposer = ({ onSubmit }) => {
  const [content, setContent] = useState("")
  const [isPosting, setIsPosting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) return
    setIsPosting(true)
    try {
      await onSubmit(content.trim())
      setContent("")
    } finally {
      setIsPosting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 rounded-lg border border-line bg-surface p-4">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's playing in your head?"
        rows={3}
      />
      <div className="flex justify-end">
        <Button type="submit" isLoading={isPosting}>
          Post
        </Button>
      </div>
    </form>
  )
}

export default TweetComposer
