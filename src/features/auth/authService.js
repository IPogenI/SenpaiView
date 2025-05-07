import api from '../../api/axios.js'

// Register User
const register = async ( userData ) => {
    const response = await api.post("/users", userData)

    if(response.data) {
        localStorage.setItem('user', JSON.stringify(response.data))
    }

    return response.data
}

// Login User
const login = async ( userData ) => {
    const response = await api.post("/users/login", userData)

    if(response.data) {
        localStorage.setItem('user', JSON.stringify(response.data))
    }

    return response.data
}

// Logout User
const logout = () => {
    localStorage.removeItem("user")
}

const authService = {
    register,
    login,
    logout
}

export default authService