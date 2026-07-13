const Input = ({ label, error, className = "", id, ...props }) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={id} className="text-xs font-medium uppercase tracking-wide text-muted">
          {label}
        </label>
      ) : null}
      <input
        id={id}
        className={`rounded-md border bg-surface px-3 py-2 text-sm text-cream placeholder:text-muted/60 focus:border-amber ${
          error ? "border-danger" : "border-line"
        } ${className}`}
        {...props}
      />
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  )
}

export default Input
