import { Link } from "react-router-dom"
import { Clapperboard } from "lucide-react"

const NotFound = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-ink text-center text-cream">
      <Clapperboard className="text-amber" size={32} />
      <h1 className="font-display text-2xl font-semibold">Scene not found</h1>
      <p className="text-sm text-muted">This reel doesn't exist, or the take got cut.</p>
      <Link to="/" className="mt-2 text-sm text-amber hover:underline">
        Back to the feed
      </Link>
    </div>
  )
}

export default NotFound
