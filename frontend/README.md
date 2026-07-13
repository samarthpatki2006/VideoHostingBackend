# Kinescope — Frontend

React + Tailwind + Axios frontend for the video-sharing backend we built together
(User, Video, Comment, Like, Tweet, Playlist, Subscription models).

## Setup

```bash
npm install
cp .env.example .env   # then set VITE_API_BASE_URL to your backend's URL
npm run dev
```

## Important assumptions — please verify against your actual backend

1. **Auth is cookie-based.** `src/api/axios.js` sets `withCredentials: true` and
   assumes your backend sets `accessToken` / `refreshToken` as httpOnly cookies
   on login/register, matching `generateAccessToken`/`generateRefreshToken` in
   your `User` model. On a 401, it calls `POST /users/refresh-token` once and
   retries the original request.

2. **`user.routes.js` / `user.controller.js` were never shared with me**, so
   `src/api/auth.api.js` assumes a conventional set of endpoints:
   - `POST /users/register` (multipart: `avatar`, `coverImage` files + `username`,
     `email`, `fullName`, `password`)
   - `POST /users/login` (`{ email or username, password }`)
   - `POST /users/logout`
   - `POST /users/refresh-token`
   - `POST /users/change-password` (`{ oldPassword, newPassword }`)
   - `GET /users/current-user`
   - `PATCH /users/update-account` (`{ fullName, email }`)
   - `PATCH /users/avatar` (multipart `avatar`)
   - `PATCH /users/cover-image` (multipart `coverImage`)
   - `GET /users/c/:username` — channel profile, expected to include
     `subscribersCount` and `isSubscribed`
   - `GET /users/history` — populated watch history videos

   **If your real routes differ, only `src/api/auth.api.js` needs editing** —
   nothing else references these paths directly.

3. **Response shape.** Every call assumes your `ApiResponse` shape
   `{ statusCode, data, message, success }`, and reads `response.data.data`.
   Errors are assumed to arrive as JSON via a global Express error-handling
   middleware that serializes thrown `ApiError` instances (status + message).
   If you don't have that middleware yet, add one — otherwise Express will send
   an HTML error page and `getErrorMessage()` won't find a `.message` field.

4. **`getVideoById` / `getVideoComments` responses** are assumed to include
   `isLiked` (video) and populated `owner` objects, matching typical aggregation
   patterns from the controllers we wrote. Adjust `VideoWatch.jsx` / `CommentSection.jsx`
   if your aggregation pipelines return different field names.

5. **Routes we built earlier require `verifyJWT` on every endpoint** (including
   plain "get" requests), so this frontend assumes the whole app is behind login —
   there's no public/guest browsing mode. Let me know if you want a public feed.

## Structure

- `src/api/` — one file per resource, thin wrappers around the shared axios instance
- `src/context/AuthContext.jsx` — current user + login/register/logout, no Redux/Query
- `src/components/` — reusable UI grouped by domain (video, playlist, tweet, common, layout)
- `src/pages/` — one file per route
- `src/utils/format.js` — view count, duration, and relative time formatting

## Design

Cinema/film theme ("Kinescope"): deep ink background, warm projector-amber accent,
a film-sprocket perforation rail on the sidebar, and viewfinder corner brackets that
appear on video thumbnail hover. Type: Space Grotesk (display), Inter (body),
IBM Plex Mono (stats/timestamps).
