import React from 'react';
import { Linkedin, Twitter, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Navigation links */}
        <div className="flex items-center space-x-8">
          <a 
            href="#" 
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Company
          </a>
          <a 
            href="#" 
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Resources
          </a>
          <a 
            href="#" 
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Legal
          </a>
        </div>

        {/* Right side - Social media icons */}
        <div className="flex items-center space-x-4">
          <a 
            href="#" 
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="LinkedIn"
          >
            <Linkedin className="w-5 h-5" />
          </a>
          <a 
            href="#" 
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Twitter"
          >
            <Twitter className="w-5 h-5" />
          </a>
          <a 
            href="#" 
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="YouTube"
          >
            <Youtube className="w-5 h-5" />
          </a>
        </div>
      </div>

      {/* Bottom text */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center text-xs text-gray-400">
          <span>Made with</span>
          <div className="mx-1 flex items-center">
            <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">V</span>
            </div>
          </div>
          <span>Visily</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;