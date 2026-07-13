import { Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext.jsx"
import ProtectedRoute from "./components/common/ProtectedRoute.jsx"
import Layout from "./components/layout/Layout.jsx"

import Login from "./pages/Login.jsx"
import Register from "./pages/Register.jsx"
import Home from "./pages/Home.jsx"
import VideoWatch from "./pages/VideoWatch.jsx"
import UploadVideo from "./pages/UploadVideo.jsx"
import EditVideo from "./pages/EditVideo.jsx"
import ChannelProfile from "./pages/ChannelProfile.jsx"
import EditProfile from "./pages/EditProfile.jsx"
import Dashboard from "./pages/Dashboard.jsx"
import Playlists from "./pages/Playlists.jsx"
import PlaylistDetail from "./pages/PlaylistDetail.jsx"
import Tweets from "./pages/Tweets.jsx"
import Subscriptions from "./pages/Subscriptions.jsx"
import LikedVideos from "./pages/LikedVideos.jsx"
import WatchHistory from "./pages/WatchHistory.jsx"
import NotFound from "./pages/NotFound.jsx"

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/watch/:videoId" element={<VideoWatch />} />
            <Route path="/upload" element={<UploadVideo />} />
            <Route path="/videos/:videoId/edit" element={<EditVideo />} />
            <Route path="/channel/:username" element={<ChannelProfile />} />
            <Route path="/settings" element={<EditProfile />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/playlists" element={<Playlists />} />
            <Route path="/playlists/:playlistId" element={<PlaylistDetail />} />
            <Route path="/tweets" element={<Tweets />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/liked-videos" element={<LikedVideos />} />
            <Route path="/history" element={<WatchHistory />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
