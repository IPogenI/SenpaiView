import { React, useState, useEffect } from 'react';
import { Bell, Filter, Search } from 'lucide-react';
import axios from "axios"

const Navbar = () => {
  const [drop, setDrop] = useState(false)
  const [animeList, setAnimeList] = useState([])
  const [query, setQuery] = useState("")

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

  //Handling clicking outside
  // useEffect(() => {
  //   const handleClickOutside = (e) => {
  //     if (dropDownRef.current && !dropDownRef.current.contains(e.target)) {
  //       setDrop(false);
  //     }
  //   }
  //   document.body.addEventListener('click', handleClickOutside);

  //   return () => {
  //     document.body.removeEventListener('click', handleClickOutside);
  //   }
  // }, [])




  return (
    <nav className="absolute w-screen bg-black text-white px-4 py-3 flex items-center justify-between z-50">
      {/* Left avatar */}
      <img
        src="/logo/Logo.png" // Replace with actual path
        alt="Profile"
        className="w-10 h-10 rounded-full border-2 border-blue-500"
      />

      {/* Center nav box */}
      <div className="flex items-center bg-[#1a1a1a] rounded-xl px-4 py-2 gap-4 w-full max-w-4xl mx-4">
        <button className="bg-[#262626] text-white px-4 py-2 rounded-md font-semibold">Home</button>

        <div className="flex items-center bg-[#1a1a1a] px-3 py-2 rounded-md text-sm text-gray-300 w-full">
          <Search size={18} className="mr-2" />


          <div className="relative inline-block text-left w-full max-w-xs">
            <input onFocus={() => setDrop(true)} onBlur={() => setTimeout(() => setDrop(false), 200)} onChange={(e) => setQuery(e.target.value)} value={query} type="text" placeholder="Search Anime" className="bg-gray-800 text-white outline-none w-full placeholder-gray-400 border border-gray-600 px-4 py-2 rounded-md" id="menu-button" aria-expanded={drop} aria-haspopup="true" />

            {drop && filteredList.length > 0 && (
              <div className="absolute right-0 z-10 mt-2 w-full origin-top-right rounded-md bg-gray-900 shadow-lg ring-1 ring-white/10 max-h-64 overflow-y-auto transition-all" role="menu" aria-orientation="vertical" aria-labelledby="menu-button">
                <div className="py-1" role="none">
                  {filteredList.map((anime, i) => (
                    <a key={i} href="#" className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 transition" role="menuitem" tabIndex={0}>
                      {anime.name}
                    </a>
                  ))}
                </div>
              </div>
            )}


          </div>
        </div>

        <button className="flex items-center bg-[#262626] px-3 py-2 rounded-md text-sm text-white">
          <Filter size={16} className="mr-1" />
          Filter
        </button>

        <div className="flex gap-4 ml-4 text-sm text-gray-300">
          <a href="#" className="hover:text-white">Trending</a>
          <a href="#" className="hover:text-white">Subscriptions</a>
          <a href="#" className="hover:text-white">Support</a>
        </div>
      </div>

      {/* Notification bell */}
      <Bell size={22} className="text-white" />
    </nav >
  );
};

export default Navbar;
