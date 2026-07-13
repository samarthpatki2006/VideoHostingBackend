const sizes = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-16 w-16",
  xl: "h-24 w-24",
}

const Avatar = ({ src, alt = "avatar", size = "md", className = "" }) => {
  return (
    <img
      src={src || "https://api.dicebear.com/7.x/identicon/svg?seed=" + alt}
      alt={alt}
      className={`${sizes[size]} shrink-0 rounded-full border border-line object-cover ${className}`}
    />
  )
}

export default Avatar
