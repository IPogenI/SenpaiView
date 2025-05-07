import { React, useState, useEffect } from 'react';
import { Filter, Search, List, ChevronDown } from 'lucide-react';
import axios from "axios";
import { Link, useNavigate } from 'react-router-dom';
import NotificationSystem from './NotificationSystem';
import Register from './Register';
import { useSelector, useDispatch } from 'react-redux'
import { logout, reset } from "../features/auth/authSlice"
import Login from './Login';

const Navbar = () => {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Function to open Register modal
  const openRegister = () => {
    setIsRegisterOpen(true);
    setIsLoginOpen(false);  // Close login modal if it's open
  };

  // Function to open Login modal from Register
  const openLogin = () => {
    setIsRegisterOpen(false); // Close Register modal
    setIsLoginOpen(true);     // Open Login modal
  };

  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth);

  const [isOpen, setIsOpen] = useState(false);
  const [drop, setDrop] = useState(false);
  const [animeList, setAnimeList] = useState([]);
  const [query, setQuery] = useState("");

  const onLogout = () => {
    dispatch(logout())
    dispatch(reset())
    navigate("/")
  }

  // Getting animelist from database
  const getAnimeList = async (query = '') => {
    try {
      const res = await axios.get(`http://localhost:8000/api/anime`);
      setAnimeList(res.data);
    } catch (err) {
      console.error("Error fetching anime list:", err);
    }
  };

  useEffect(() => {
    if (drop && animeList.length === 0) {
      getAnimeList();
    }
  }, [drop]);

  const filteredList = animeList.filter(anime =>
    anime.name.toLowerCase().includes(query.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  return (
    <nav className="fixed w-full text-white px-4 sm:px-8 py-2 flex items-center justify-between z-50 bg-gray-900 bg-opacity-90 backdrop-blur-sm">
      {/* Left avatar with dropdown */}
      <div className="dropdown-container relative">
        {user ? (
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-2 cursor-pointer select-none"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <img
                src="/logo/Logo.png"
                alt="Profile"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-blue-500 select-none"
              />
              <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''} select-none`} />
            </div>

            {/* Dropdown menu */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-50 select-none">
                {user.isAdmin && (
                  <Link
                    to="/admin"
                    className="block px-4 py-2 text-sm text-white hover:bg-gray-700"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Admin Panel
                  </Link>
                )}
                {!user.isAdmin && (
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-white hover:bg-gray-700"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                )}
                <button
                  onClick={() => {
                    onLogout();
                    setIsDropdownOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex gap-2">
            <img
              src="/logo/Logo.png"
              alt="Profile"
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-blue-500 cursor-pointer select-none"
              onClick={openRegister}
            />
            <Register open={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} onLogin={openLogin} />
            <Login loggedIn={isLoginOpen} onLoginClose={() => setIsLoginOpen(false)} onRegister={openRegister} />
          </div>
        )}
      </div>

      {/* Center nav box */}
      <div className="flex-1 flex justify-center">
        <div className="flex items-center gap-4 sm:gap-8">
          <Link to="/" className="text-sm sm:text-base hover:text-blue-400 transition-colors">Home</Link>
          <Link to="/all-anime" className="text-sm sm:text-base hover:text-blue-400 transition-colors">All Anime</Link>
          <Link to="/watchlist" className="text-sm sm:text-base hover:text-blue-400 transition-colors">Watchlist</Link>
          <Link to="/watch-history" className="text-sm sm:text-base hover:text-blue-400 transition-colors">History</Link>
        </div>
      </div>

      {/* Right search box */}
      <div className="hidden sm:block">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="bg-gray-800 text-white px-4 py-1 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
