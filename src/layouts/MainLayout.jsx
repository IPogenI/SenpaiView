import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import ChatBot from '../components/ChatBot'
// import { ToastContainer } from 'react-toastify'
// import 'react-toastify/dist/ReactToastify.css'

const MainLayout = () => {
    return (
        <>
            <Navbar />
            <Outlet />
            <ChatBot />
            {/* <ToastContainer /> */}
        </>
    )
}

export default MainLayout