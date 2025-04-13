import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import React, { useState } from 'react'
import MainLayout from './layouts/MainLayout.jsx'
import HomePage from './pages/HomePage.jsx'
import About from './pages/About.jsx'
import WatchlistPage from './pages/WatchlistPage.jsx'
import AnimeDetailsPage from './pages/AnimeDetailsPage.jsx'
import AllAnimePage from './pages/AllAnimePage.jsx'
import StreamPage from './pages/StreamPage.jsx'
import DynamicStreamPage from './pages/DynamicStreamPage.jsx'
import Register from './components/Register.jsx'
import Login from './components/Login.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import YouTubePlayerPage from './pages/YouTubePlayerPage.jsx'
import WatchHistoryPage from './pages/WatchHistoryPage.jsx'

function App() {
  const [count, setCount] = useState(0)

  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path='/' element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path='/about' element={<About />} />
          <Route path='/watchlist' element={<WatchlistPage />} />
          <Route path='/watch-history' element={<WatchHistoryPage />} />
          <Route path='/anime/:id' element={<AnimeDetailsPage />} />
          <Route path='/anime/:id/watch' element={<DynamicStreamPage />} />
          <Route path='/all-anime' element={<AllAnimePage />} />
          <Route path='/stream' element={<StreamPage />} />
          <Route path='/profile' element={<ProfilePage />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/youtube/:videoId' element={<YouTubePlayerPage />} />
        </Route>
      </>
    )
  )

  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer />
    </>
  )
}

export default App
