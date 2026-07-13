const EmptyState = ({ title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-line py-16 text-center">
      <p className="font-display text-lg text-cream">{title}</p>
      {description ? <p className="max-w-sm text-sm text-muted">{description}</p> : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  )
}

export default EmptyState
