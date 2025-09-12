
import { NavLink, Outlet } from "react-router-dom";
import DealerHeader from "./Header/DealerHeader";
import DealerFooter from "./Footer/DealerFooter";

import DealerSidebar from "./Sidebar/DealerSidebar";


const DealerLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-slate-100">
      <DealerHeader />
      <div className="flex-1 grid md:grid-cols-[280px_1fr]">
        {/* Sidebar Dealer */}
        <DealerSidebar />
        {/* Nội dung Dealer */}
        <main className="p-1">
          <Outlet />
        </main>
      </div>
      <DealerFooter />
    </div>
  );
};

export default DealerLayout;