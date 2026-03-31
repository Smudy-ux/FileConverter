'use client';

import React, { useState, useRef, useEffect } from "react";
import { SlArrowDown } from "react-icons/sl";
import { FiImage, FiVideo, FiFileText } from "react-icons/fi";

interface ConversionOption {
  id: string;
  label: string;
  from: string;
  to: string;
  toLabel: string;
  type: 'image' | 'video' | 'document';
  acceptTypes: string[];
}

const IMAGE_CONVERSIONS: ConversionOption[] = [
  { id: 'png-jpg', label: 'PNG to JPG', from: 'png', to: 'jpeg', toLabel: 'JPG', type: 'image', acceptTypes: ['image/png'] },
  { id: 'jpg-png', label: 'JPG to PNG', from: 'jpeg', to: 'png', toLabel: 'PNG', type: 'image', acceptTypes: ['image/jpeg', 'image/jpg'] },
  { id: 'webp-png', label: 'WebP to PNG', from: 'webp', to: 'png', toLabel: 'PNG', type: 'image', acceptTypes: ['image/webp'] },
  { id: 'png-webp', label: 'PNG to WebP', from: 'png', to: 'webp', toLabel: 'WebP', type: 'image', acceptTypes: ['image/png'] },
  { id: 'jpg-webp', label: 'JPG to WebP', from: 'jpeg', to: 'webp', toLabel: 'WebP', type: 'image', acceptTypes: ['image/jpeg', 'image/jpg'] },
  { id: 'webp-jpg', label: 'WebP to JPG', from: 'webp', to: 'jpeg', toLabel: 'JPG', type: 'image', acceptTypes: ['image/webp'] },
];

const DOCUMENT_CONVERSIONS: ConversionOption[] = [
  { id: 'images-pdf', label: 'Images to PDF', from: 'image', to: 'pdf', toLabel: 'PDF', type: 'document', acceptTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'] },
];

const NavBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleConversionSelect = (option: ConversionOption) => {
    // Store the selected conversion for the main component
    sessionStorage.setItem('navbarConversion', JSON.stringify(option));
    // Dispatch event to notify main component
    window.dispatchEvent(new Event('navbarConversion'));
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between px-6 py-4 bg-black/50 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center text-xl font-bold">
          Free<span className="text-blue-500">Converter</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="hover:bg-white/10 rounded-lg px-5 py-2.5 text-sm font-medium flex items-center gap-2 transition-all border border-transparent hover:border-white/10"
            >
              Convert
              <SlArrowDown className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}/>
            </button>

            {isOpen && (
              <div className="absolute top-full right-0 mt-2 w-72 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Images Section */}
                <div className="p-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2 px-2">
                    <FiImage className="w-4 h-4" />
                    Images
                  </div>
                  <div className="space-y-0.5">
                    {IMAGE_CONVERSIONS.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleConversionSelect(option)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center justify-between group"
                      >
                        <span>{option.label}</span>
                        <span className="text-xs text-gray-500 group-hover:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          → {option.toLabel}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mx-3" />

                {/* Documents Section */}
                <div className="p-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2 px-2">
                    <FiFileText className="w-4 h-4" />
                    Documents
                  </div>
                  <div className="space-y-0.5">
                    {DOCUMENT_CONVERSIONS.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleConversionSelect(option)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center justify-between group"
                      >
                        <span>{option.label}</span>
                        <span className="text-xs text-gray-500 group-hover:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          → {option.toLabel}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <a
            href="https://github.com/Smudy-ux"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:bg-white/10 rounded-lg px-4 py-2.5 text-sm font-medium flex items-center gap-2 transition-all border border-transparent hover:border-white/10"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            GitHub
          </a>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
