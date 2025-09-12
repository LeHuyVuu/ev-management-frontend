import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layouts
import DealerLayout from "../layouts/DealerLayout";
import EVMLayout from "../layouts/EVMLayout";

// Dealer pages
import ManagerDashboard from "../pages/Dealer/Manager Dealer/ManagerDashboard";
import ContractManagement from "../pages/Dealer/Staff Dealer/Contact/ContractManagement";
import CustomerCRM from "../pages/Dealer/Staff Dealer/Customer CRM/CustomerCRM";
import DeliveryTracking from "../pages/Dealer/Staff Dealer/Delivery Tracking/DeliveryTracking";
import DriverSchedule from "../pages/Dealer/Staff Dealer/Driver Schedule/DriverSchedule";
import QuoteManagement from "../pages/Dealer/Staff Dealer/Quote Management/QuoteManagement";
import VehicleAllocation from "../pages/Dealer/Staff Dealer/Vehicle Allocation/VehicleAllocation";
import VehicleManagement from "../pages/Dealer/Staff Dealer/Vehicle Management/VehicleManagement";

// EVM pages
import ProductDistribution from "../pages/EVM/ProductDistribution/ProductDistribution";
import DealerManagement from "../pages/EVM/DealerManagement/DealerManagement";
import ReportsAnalytics from "../pages/EVM/ReportsAnalytics/ReportsAnalytics";

// 🚫 Tạm thời vô hiệu hóa Auth để test
// import Authentication from "../pages/Authentication/Authentication";

const MainRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🚫 Tạm thời tắt login redirect & trang login */}
        {/*
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Authentication />} />
        */}

        {/* Dealer group */}
        <Route path="/dealer" element={<DealerLayout />}>
          <Route path="contact" element={<ContractManagement />} />
          <Route path="customer-crm" element={<CustomerCRM />} />
          <Route path="delivery-tracking" element={<DeliveryTracking />} />
          <Route path="driver-schedule" element={<DriverSchedule />} />
          <Route path="quote-management" element={<QuoteManagement />} />
          <Route path="vehicle-allocation" element={<VehicleAllocation />} />
          <Route path="vehicle-management" element={<VehicleManagement />} />
        </Route>

        {/* EVM group */}
        <Route path="/evm" element={<EVMLayout />}>
          <Route path="product-distribution" element={<ProductDistribution />} />
          <Route path="dealer-management" element={<DealerManagement />} />
          <Route path="reports-analytics" element={<ReportsAnalytics />} />
        </Route>

        {/* 404 fallback */}
        <Route path="*" element={<div className="p-6">Not Found</div>} />
        <Route path="/dealer/manager" element={<ManagerDashboard />} />
      </Routes>
    </BrowserRouter>
  );
};

export default MainRoutes;
