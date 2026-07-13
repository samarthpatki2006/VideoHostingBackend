import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../../context/useAuth.js"
import Loader from "./Loader.jsx"

const ProtectedRoute = () => {
  const { user, isLoading } = useAuth()

  if (isLoading) return <Loader label="Checking session" />
  if (!user) return <Navigate to="/login" replace />

  return <Outlet />
}

export default ProtectedRoute
