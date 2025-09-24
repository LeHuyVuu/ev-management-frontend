import { FaSearch } from "react-icons/fa";

export default function DealerHeader() {
    return (
        <header className="bg-white border-b">
            <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">

                {/* Logo */}
                <div className="flex items-center space-x-2">
                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTnZfrwLKBUrEEL6oD9XsTdK7YqRaDM6yCpgw&s" alt="Logo" className="h-10 w-full" />
                    
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
            </div>
        </header>
    );
}
