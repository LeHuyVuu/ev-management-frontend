import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

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
import VehicleSearch from "../pages/Dealer/Staff Dealer/VehicleSearch/VehicleSearch";

// EVM pages
import AccountManagement from "../pages/EVM/Account Management/AccountManagement";
import DashboardManagement from "../pages/EVM/Dashboard Management/EVMDashboardManagement";
import DealerManagerment from "../pages/EVM/Dealer Management/DealerManagerment";
import VehicleManagementEVM from "../pages/EVM/Vehicle Management/VehicleManagementEVM";
import EVMDashboardManagement from "../pages/EVM/Dashboard Management/EVMDashboardManagement";
import Authentication from "../pages/Authentication/Authentication";

const MainRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home -> EVM dashboard */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Trang login */}
        <Route path="/login" element={<Authentication />} />
        {/* Dealer group (must render <Outlet /> inside DealerLayout) */}
        <Route path="/dealer" element={<DealerLayout />}>          {/* NOTE: child paths are relative (no leading slash) */}
          <Route path="dashboard" element={<ManagerDashboard />} />
          <Route path="vehicle-search" element={<VehicleSearch />} />
          <Route path="contact" element={<ContractManagement />} />
          <Route path="customer-crm" element={<CustomerCRM />} />
          <Route path="delivery-tracking" element={<DeliveryTracking />} />
          <Route path="driver-schedule" element={<DriverSchedule />} />
          <Route path="quote-management" element={<QuoteManagement />} />
          <Route path="vehicle-allocation" element={<VehicleAllocation />} />
          <Route path="vehicle-management" element={<VehicleManagement />} />
        </Route>

        {/* EVM group (must render <Outlet /> inside EVMLayout) */}
        <Route path="/evm" element={<EVMLayout />}>
          <Route path="account" element={<AccountManagement />} />
          <Route path="dealer" element={<DealerManagerment />} />
          <Route path="vehicle" element={<VehicleManagementEVM />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<div className="p-6">Not Found</div>} />

        {/* Direct routes (no layout) */}
        <Route path="/evm/dashboard" element={<EVMDashboardManagement />} />

      </Routes>
    </BrowserRouter>
  );
};

export default MainRoutes;
