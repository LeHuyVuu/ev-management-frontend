const Footer = () => {
  return (
    <footer className="bg-gray-800 text-gray-200 mt-10">
      <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center">
        <p className="text-sm">
          © {new Date().getFullYear()} EV Sales Management. All rights reserved.
        </p>
        <div className="space-x-4 mt-3 md:mt-0">
          <a href="#" className="hover:text-white">Privacy</a>
          <a href="#" className="hover:text-white">Terms</a>
          <a href="#" className="hover:text-white">Support</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
