import { FaFacebookF, FaTwitter, FaLinkedinIn, FaYoutube } from "react-icons/fa";

export default function DealerFooter() {
  return (
    <footer className="bg-white border-t mt-6">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between text-sm text-gray-600">
        
        {/* Left side */}
        <div className="flex items-center space-x-6 mb-2 md:mb-0">
          <span className="font-medium text-gray-800">AutoManager Pro</span>
          <a href="#" className="hover:text-gray-900">Tài nguyên</a>
          <a href="#" className="hover:text-gray-900">Pháp lý</a>
        </div>

        {/* Right side - social icons */}
        <div className="flex space-x-4 text-gray-600">
          <a href="#" className="hover:text-blue-600">
            <FaFacebookF />
          </a>
          <a href="#" className="hover:text-sky-500">
            <FaTwitter />
          </a>
          <a href="#" className="hover:text-blue-700">
            <FaLinkedinIn />
          </a>
          <a href="#" className="hover:text-red-600">
            <FaYoutube />
          </a>
        </div>
      </div>
    </footer>
  );
}
