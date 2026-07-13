const Loader = ({ label = "Loading" }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-amber border-t-transparent" />
      <span className="font-mono text-xs uppercase tracking-widest">{label}</span>
    </div>
  )
}

export default Loader
