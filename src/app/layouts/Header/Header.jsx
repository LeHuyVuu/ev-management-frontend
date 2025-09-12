const Header = () => {
  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <h1 className="text-xl font-bold">EV Sales Management</h1>

        {/* Navigation */}
        <nav className="space-x-6">
          <a href="/" className="hover:text-gray-200">Home</a>
          <a href="/dealer/manager" className="hover:text-gray-200">Dealer</a>
          <a href="/evm/dashboard" className="hover:text-gray-200">EVM</a>
          <a href="/contact" className="hover:text-gray-200">Contact</a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
