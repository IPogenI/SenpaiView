import {Route, createBrowserRouter, createRoutesFromElements, RouterProvider, Navigate} from 'react-router-dom'
import React, { useState } from 'react'
import MainLayout from './layouts/MainLayout.jsx'
import HomePage from './pages/HomePage.jsx'
import About from './pages/About.jsx'

function App() {
  const [count, setCount] = useState(0)

  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path='/' element={<MainLayout/>}>
          <Route index element={<HomePage/>} />
          <Route path='/about' element={<About/>} />
        </Route>
      </>
    )
  )

  return (
    <RouterProvider router={router} />
  )
}

export default App
