import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Bookmark } from 'lucide-react';

const slides = [
  {
    title: 'Solo Leveling',
    subtitle: 'Arise from the Shadows',
    rating: 'PG-13',
    release: '2024',
    quality: 'HD',
    tags: ['CC 20', '23'],
    bg: "/img/wp11485180-solo-leveling-manga-wallpapers.png", // Insert actual image URL or path later
  },
  {
    title: 'Frieren',
    subtitle: "Beyond Journey's End",
    rating: 'PG-13',
    release: '2023',
    quality: 'HD',
    tags: ['CC 28', '28'],
    bg: "/img/wp14738966-frieren-desktop-wallpapers.jpg",
  },
];

const HomePage = () => {

  const [index, setIndex] = useState(0);
  const current = slides[index];

  const nextSlide = () => setIndex((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setIndex((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <>
      <div
        className="relative bg-cover bg-center min-h-screen text-white transition-all duration-500 flex items-center"
        style={{
          backgroundImage: current.bg ? `url(${current.bg})` : 'linear-gradient(to right, #0f0f0f, #1a1a1a)', 
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}>

        {/* Overlay */}
        <div className="absolute top-0 left-0 w-screen h-screen bg-black opacity-50" />

        {/* Content */}
        <div className="relative z-10 px-48 sm:px-48 max-w-6xl">
          <h1 className="text-3xl sm:text-5xl font-bold mb-3">{current.title}</h1>
          <h2 className="text-lg sm:text-xl font-light text-gray-300 mb-4">{current.subtitle}</h2>

          {/* Tags */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {current.tags.map((tag, i) => (
              <span
                key={i}
                className={`text-xs px-2 py-1 rounded-md ${i % 2 === 0 ? 'bg-red-600' : 'bg-green-600'
                  }`}>
                {tag}
              </span>
            ))}
          </div>

          {/* Info */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="bg-black bg-opacity-80 px-4 py-2 rounded-md text-center">
              <p className="text-sm text-gray-400">Rating</p>
              <p className="text-lg font-semibold">{current.rating}</p>
            </div>
            <div className="bg-black bg-opacity-80 px-4 py-2 rounded-md text-center">
              <p className="text-sm text-gray-400">Release</p>
              <p className="text-lg font-semibold">{current.release}</p>
            </div>
            <div className="bg-black bg-opacity-80 px-4 py-2 rounded-md text-center">
              <p className="text-sm text-gray-400">Quality</p>
              <p className="text-lg font-semibold">{current.quality}</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-4 mb-10">
            <button className="bg-cyan-500 hover:bg-cyan-600 text-black font-semibold px-6 py-2 rounded-md transition">
              WATCH NOW
            </button>
            <button className="p-2 bg-black bg-opacity-50 rounded-md border border-white/20">
              <Bookmark className="text-white" size={20} />
            </button>
          </div>
        </div>

        {/* Arrows */}
        <div className="absolute right-4 bottom-8 z-20 flex items-center gap-2 sm:right-10">
          <button onClick={prevSlide} className="p-2 bg-black bg-opacity-70 rounded-full hover:bg-opacity-90">
            <ChevronLeft size={20} />
          </button>
          <button onClick={nextSlide} className="p-2 bg-black bg-opacity-70 rounded-full hover:bg-opacity-90">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </>
  );
};

export default HomePage;
