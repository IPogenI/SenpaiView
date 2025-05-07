import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_API_URL || '/api',
  withCredentials: true, // if you need cookies/auth
});

export default api; 