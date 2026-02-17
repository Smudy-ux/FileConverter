import React from "react";

const DropDownConvertation = ({ closeMenu }) => {
    return(
        <div className="bg-[#121212] border border-white/10 rounded-xl shadow-2xl overflow-hidden min-w-[400px]">
            <div className="flex">           
                    {/* Left Column: Image Formats */}
                    <div className="flex-1 p-4">
                        <h3 className="text-xs font-bold text-blue-400 uppercase mb-4 tracking-widest">Images</h3>
                        <ul className="space-y-2">
                            <li><button onClick={closeMenu} className="w-full text-left text-sm text-gray-300 hover:text-white transition-colors"> PNG to JPG</button></li>
                            <li><button onClick={closeMenu} className="w-full text-left text-sm text-gray-300 hover:text-white transition-colors"> JPG to PNG</button></li>
                            <li><button onClick={closeMenu} className="w-full text-left text-sm text-gray-300 hover:text-white transition-colors"> SVG to PNG</button></li>
                            <li><button onClick={closeMenu} className="w-full text-left text-sm text-gray-300 hover:text-white transition-colors"> PNG to SVG</button></li>
                        </ul>
                    </div>

                    {/* THE VERTICAL SEPARATOR */}
                    <div className="w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent my-4"></div>

                    {/* Right Column: Video/Other Formats */}

                    <div className="flex-1 p-4">
                        <h3 className="text-xs font-bold text-emerald-400 uppercase mb-4 tracking-widest">Video & Docs</h3>
                        <ul className="space-y-2">
                            <li><button onClick={closeMenu} className="w-full text-left text-sm text-gray-300 hover:text-white transition-colors">MP4 to GIF</button></li>
                            <li><button onClick={closeMenu} className="w-full text-left text-sm text-gray-300 hover:text-white transition-colors">MOV to MP4</button></li>
                            <li><button onClick={closeMenu} className="w-full text-left text-sm text-gray-300 hover:text-white transition-colors">PDF to Word</button></li>
                            <li><button onClick={closeMenu} className="w-full text-left text-sm text-gray-300 hover:text-white transition-colors">Images to PDF</button></li>
                        </ul>
                    </div>  
            </div>
            
            <div className="border-t border-white/5 bg-white/[0.02] p-3 text-center">
                <button onClick={closeMenu} className="text-sm text-gray-400 hover:text-white transition-colors">Other formats comming soon...</button>
            </div>
        </div>
    );
}

export default DropDownConvertation;