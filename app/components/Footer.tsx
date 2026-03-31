'use client';

import React from 'react';
import { FiGithub, FiHeart } from 'react-icons/fi';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/10 bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <span>Made with</span>
            <FiHeart className="text-red-500 w-4 h-4" />
            <span>by</span>
            <a
              href="https://github.com/Smudy-ux"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              Smudy-ux
            </a>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a
              href="https://github.com/Smudy-ux/FileConverter"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-gray-300 transition-colors"
            >
              <FiGithub className="w-4 h-4" />
              Source Code
            </a>
            <span>FreeFileConverter</span>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-white/5 text-center">
          <p className="text-xs text-gray-600">
            All conversions happen locally in your browser. No files are uploaded to any server.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
