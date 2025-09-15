import { FaSearch } from "react-icons/fa";

export default function DealerHeader() {
    return (
        <header className="bg-white border-b">
            <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">

                {/* Logo */}
                <div className="flex items-center space-x-2">
                    <span className="text-blue-500 text-2xl font-bold">*</span>
                </div>

                {/* Search box */}
                <div className="flex-1 mx-4 max-w-md relative">
                    <input
                        type="text"
                        placeholder="Tìm kiếm..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>

                {/* User Avatar */}
                <div className="flex items-center space-x-3">
                    <img
                        src="https://i.pravatar.cc/40"
                        alt="User avatar"
                        className="w-9 h-9 rounded-full border"
                    />
                </div>
            </div>
        </header>
    );
}
