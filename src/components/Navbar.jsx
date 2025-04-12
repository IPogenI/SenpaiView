import { React, useState, useEffect } from 'react';
import { Filter, Search, List } from 'lucide-react';
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
  const { user } = useSelector((state) => state.auth)

  const [isOpen, setIsOpen] = useState(false)
  const [drop, setDrop] = useState(false)
  const [animeList, setAnimeList] = useState([])
  const [query, setQuery] = useState("")
  const userId = "1" // Hardcoded for now

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



  return (
    <nav className="absolute w-screen text-white px-8 py-2 flex items-center justify-between z-50">
      {/* Left avatar */}
      {user ? (
        <li className="flex gap-2">
          <img
            src="/logo/Logo.png" // Replace with actual path
            alt="Profile"
            className="w-10 h-10 rounded-full border-2 border-blue-500"
          />
          <button className="btn" onClick={onLogout}>
            Logout
          </button>
        </li>
      ) : (
        <div className="flex gap-2">
          <img
            src="/logo/Logo.png" // Replace with actual path
            alt="Profile"
            className="w-10 h-10 rounded-full border-2 border-blue-500"
            onClick={openRegister}
          />
          <Register open={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} onLogin={openLogin} />
          <Login loggedIn={isLoginOpen} onLoginClose={() => setIsLoginOpen(false)} />
        </div>
      )
      }


      {/* Center nav box */}
      <div className="flex items-center justify-center bg-[#1a1a1a] rounded-xl px-4 py-2 gap-4 w-full max-w-4xl mx-4">
        <Link to="/" className="flex items-center bg-[#262626] px-3 py-2 rounded-md text-sm text-white hover:bg-[#333333] whitespace-nowrap">
          Home
        </Link>

        <div className="flex items-center bg-[#1a1a1a] px-3 py-2 rounded-md text-sm text-gray-300 w-full">
          <Search size={18} className="mr-2" />


          <div className="relative inline-block text-left w-full max-w-xs">
            <input onFocus={() => setDrop(true)} onBlur={() => setTimeout(() => setDrop(false), 200)} onChange={(e) => setQuery(e.target.value)} value={query} type="text" placeholder="Search Anime" className="bg-gray-800 text-white outline-none w-full placeholder-gray-400 border border-gray-600 px-4 py-2 rounded-md" id="menu-button" aria-expanded={drop} aria-haspopup="true" />

            {drop && filteredList.length > 0 && (
              <div className="absolute right-0 z-10 mt-2 w-full origin-top-right rounded-md bg-gray-900 shadow-lg ring-1 ring-white/10 max-h-64 overflow-y-auto transition-all" role="menu" aria-orientation="vertical" aria-labelledby="menu-button">
                <div className="py-1" role="none">
                  {filteredList.map((anime, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        setDrop(false);
                        navigate(`/anime/${anime._id}`);
                      }}
                      className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 transition cursor-pointer"
                      role="menuitem"
                      tabIndex={0}
                    >
                      {anime.name}
                    </div>
                  ))}
                </div>
              </div>
            )}


          </div>
        </div>

        <Link to="/all-anime" className="flex items-center bg-[#262626] px-3 py-2 rounded-md text-sm text-white hover:bg-[#333333] whitespace-nowrap">
          All Anime
        </Link>
        <button className="flex items-center bg-[#262626] px-3 py-2 rounded-md text-sm text-white hover:bg-[#333333]">
          <Filter size={16} className="mr-1" />
          Filter
        </button>

        <div className="flex gap-4 ml-4 text-sm text-gray-300">
          <a href="#" className="hover:text-white">Trending</a>
          <a href="#" className="hover:text-white">Subscriptions</a>
          <a href="#" className="hover:text-white">Support</a>
        </div>
      </div>

      {/* Right side icons */}
      <div className="flex items-center gap-4">
        <Link to="/watchlist" className="flex items-center text-white hover:text-gray-300">
          <List size={22} />
        </Link>
        <NotificationSystem userId={userId} />
      </div>
    </nav >
  );
};

export default Navbar;
