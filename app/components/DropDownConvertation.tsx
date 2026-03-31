'use client';

import React from "react";

interface DropDownConvertationProps {
  closeMenu: () => void;
}

interface ConversionOption {
  label: string;
  from: string;
  to: string;
  type: 'image' | 'video' | 'document';
}

const imageOptions: ConversionOption[] = [
  { label: "PNG to JPG", from: "png", to: "jpeg", type: "image" },
  { label: "JPG to PNG", from: "jpeg", to: "png", type: "image" },
  { label: "WebP to PNG", from: "webp", to: "png", type: "image" },
  { label: "PNG to WebP", from: "png", to: "webp", type: "image" },
];

const videoOptions: ConversionOption[] = [
  { label: "MP4 to GIF", from: "mp4", to: "gif", type: "video" },
  { label: "WebM to MP4", from: "webm", to: "mp4", type: "video" },
];

const documentOptions: ConversionOption[] = [
  { label: "Images to PDF", from: "image", to: "pdf", type: "document" },
];

const DropDownConvertation: React.FC<DropDownConvertationProps> = ({ closeMenu }) => {
  const handleOptionClick = (option: ConversionOption) => {
    // Store the selected conversion in session storage for the main component to use
    sessionStorage.setItem('selectedConversion', JSON.stringify(option));
    closeMenu();
  };

  return (
    <div className="bg-[#121212] border border-white/10 rounded-xl shadow-2xl overflow-hidden min-w-[400px]">
      <div className="flex">
        {/* Left Column: Image Formats */}
        <div className="flex-1 p-4">
          <h3 className="text-xs font-bold text-blue-400 uppercase mb-4 tracking-widest">Images</h3>
          <ul className="space-y-2">
            {imageOptions.map((option) => (
              <li key={option.label}>
                <button
                  onClick={() => handleOptionClick(option)}
                  className="w-full text-left text-sm text-gray-300 hover:text-white transition-colors py-1"
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Vertical Separator */}
        <div className="w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent my-4"></div>

        {/* Right Column: Video & Docs */}
        <div className="flex-1 p-4">
          <h3 className="text-xs font-bold text-emerald-400 uppercase mb-4 tracking-widest">Video & Docs</h3>
          <ul className="space-y-2">
            {videoOptions.map((option) => (
              <li key={option.label}>
                <button
                  onClick={() => handleOptionClick(option)}
                  className="w-full text-left text-sm text-gray-300 hover:text-white transition-colors py-1"
                >
                  {option.label}
                </button>
              </li>
            ))}
            {documentOptions.map((option) => (
              <li key={option.label}>
                <button
                  onClick={() => handleOptionClick(option)}
                  className="w-full text-left text-sm text-gray-300 hover:text-white transition-colors py-1"
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/5 bg-white/[0.02] p-3 text-center">
        <span className="text-sm text-gray-400">More formats coming soon...</span>
      </div>
    </div>
  );
};

export default DropDownConvertation;
