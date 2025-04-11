import React, { useState } from 'react'
import ReactPlayer from "react-player/lazy"
import { FiSearch } from "react-icons/fi"
import { MdOutlineEdit } from "react-icons/md"
import { BsFillCcSquareFill } from "react-icons/bs"
import "./Stream.css"

const TOTAL_EPISODES = 12

const Stream = () => {
    const [selectedEp, setSelectedEp] = useState(1)
    const generateVideoSrc = (ep) => `/vids/soloLeveling/s1e${ep}.mp4`

    return (
        <div className='flex items-center justify-center w-screen h-screen bg-gray-900'>
            <div className="flex h-[80%] w-[80%] text-white pt-26">
                <div className="w-3/4 pl-25 pr-25 pb-25">
                    <ReactPlayer url={generateVideoSrc(selectedEp)} controls width="100%" height="60vh" className="react-player rounded-lg border-2 border-gray-700"
                    />
                </div>

                {/* Side Bar */}
                <div className="w-1/4 bg-[#18181c] p-4 overflow-y-auto border border-gray-600 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Episodes</h2>
                        <div className="flex items-center gap-2">
                            <button className="px-2 py-1 text-sm bg-gray-800 rounded-md text-gray-400 flex items-center gap-1">
                                <FiSearch /> Find
                            </button>
                            <button className="bg-red-600 rounded px-2 py-1 text-sm">
                                <BsFillCcSquareFill />
                            </button>
                            <button className="bg-gray-700 rounded px-2 py-1 text-sm">
                                <MdOutlineEdit />
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-between items-center bg-gray-800 text-sm text-gray-300 px-3 p-3 rounded mb-4">
                        <span>{"<"}</span>
                        <span>001–012</span>
                        <span>{">"}</span>
                    </div>

                    <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                        {Array.from({ length: TOTAL_EPISODES }, (_, i) => i + 1).map((ep) => (
                            <button key={ep} onClick={() => setSelectedEp(ep)} className={`w-10 h-10 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-md text-sm font-medium shadow-sm flex items-center justify-center transition-all duration-200 ${selectedEp === ep ? "bg-orange-600 text-white" : "bg-[#2c2c30] text-gray-300 hover:bg-[#38383e]"}`}>
                                {ep}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Stream
