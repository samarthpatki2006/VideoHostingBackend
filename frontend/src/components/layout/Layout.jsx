import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar.jsx"
import Navbar from "./Navbar.jsx"

const Layout = () => {
  return (
    <div className="flex min-h-screen bg-ink text-cream">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar />
        <main className="flex-1 px-5 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
