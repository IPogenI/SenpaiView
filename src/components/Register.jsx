import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {toast} from 'react-toastify'
import { register, reset } from '../features/auth/authSlice'
import Spinner from "../components/Spinner"


const Styles = {
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  zIndex: 1000
}

const Overlay = {
  position: "fixed",
  top: "0",
  left: "0",
  right: "0",
  bottom: "0",
  backgroundColor: "rgba(0,0,0,0.7)",
  zIndex: 1000
}


const Register = ({ open, onClose, onLogin }) => {
  if (!open) return null
  const loginUser = () => {
    onClose()
    setIsLogin(true)
  }

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    cpassword: "",
  })

  const { name, email, password, cpassword } = formData

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const {user, isLoading, isError, isSuccess, message} = useSelector((state) => state.auth)

  useEffect(() => {
    if(isError){
      toast.error(message)
    }

    if(isSuccess || user){
      navigate('/')
    }

    dispatch(reset())

  }, [user, isError, isSuccess, message, navigate, dispatch])

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }))
  }

  const onSubmit = (e) => {
    e.preventDefault()

    if(password !== cpassword){
      toast.error("Passwords do not match!")
    } else {
      const userData = {
        name, 
        email, 
        password
      }

      dispatch(register(userData))
    }
  }

  if(isLoading){
    return <Spinner />
  }

  return (
    <>
      <div style={Overlay}></div>
      <div style={Styles} className='flex h-screen w-[400px]'>
        <section className="relative form flex self-center h-[40vh] w-screen bg-gray-800 p-12 rounded-lg">
          {/* ❌ Cross button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-gray-400 hover:text-gray-800 text-2xl font-bold focus:outline-none">
            &times;
          </button>
          <form onSubmit={onSubmit} className="flex flex-col justify-center items-center w-[100%] space-y-4 pt-4">
            <input type="text" id="name" name="name" value={name} onChange={onChange}
              placeholder="Enter Name"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500" />

            <input type="email" id="email" name="email" value={email} onChange={onChange}
              placeholder="Enter Email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500" />

            <input type="password" id="password" name="password" value={password} onChange={onChange}
              placeholder="Enter Password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500" />

            <input type="password" id="cpassword" name="cpassword" value={cpassword} onChange={onChange}
              placeholder="Confirm Password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500" />

            <button type="submit"
              className="w-full bg-orange-500 text-white font-semibold py-2 rounded-md hover:bg-orange-600 transition duration-200">
              Submit
            </button>

            <button type="button">
              <span className='text-gray-400 px-1'>Already Registered?</span>
              <span className='text-blue-700 cursor-pointer' onClick={onLogin}>Sign in</span>
            </button>
          </form>
        </section>
      </div>
    </>
  )
}

export default Register