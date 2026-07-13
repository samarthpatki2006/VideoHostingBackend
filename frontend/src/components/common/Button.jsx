const variants = {
  primary: "bg-amber text-ink hover:bg-amber-dim disabled:opacity-40",
  secondary: "bg-surface2 text-cream border border-line hover:border-amber disabled:opacity-40",
  ghost: "bg-transparent text-muted hover:text-cream disabled:opacity-40",
  danger: "bg-transparent text-danger border border-danger/40 hover:bg-danger/10 disabled:opacity-40",
}

const Button = ({
  children,
  variant = "primary",
  className = "",
  isLoading = false,
  disabled = false,
  type = "button",
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors duration-150 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </button>
  )
}

export default Button
