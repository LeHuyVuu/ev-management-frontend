import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layouts
import DealerLayout from "../layouts/DealerLayout";
import EVMLayout from "../layouts/EVMLayout";

// Dealer pages
import ManagerDashboard from "../pages/Dealer/Manager Dealer/ManagerDashboard";
import ContractManagement from "../pages/Dealer/Staff Dealer/Contract/ContractManagement";
import CustomerCRM from "../pages/Dealer/Staff Dealer/Customer CRM/CustomerCRM";
import DeliveryTracking from "../pages/Dealer/Staff Dealer/Delivery Tracking/DeliveryTracking";
import DriverSchedule from "../pages/Dealer/Staff Dealer/Driver Schedule/DriverSchedule";
import QuoteManagement from "../pages/Dealer/Staff Dealer/Quote Management/QuoteManagement";
import VehicleAllocation from "../pages/Dealer/Staff Dealer/Vehicle Allocation/VehicleAllocation";
import VehicleManagement from "../pages/Dealer/Staff Dealer/Vehicle Management/VehicleManagement";
import VehicleSearch from "../pages/Dealer/Staff Dealer/VehicleSearch/VehicleSearch";

// EVM pages
import ProductDistribution from "../pages/EVM/ProductDistribution/ProductDistribution";
import DealerManagement from "../pages/EVM/DealerManagement/DealerManagement";
import ReportsAnalytics from "../pages/EVM/ReportsAnalytics/ReportsAnalytics";
import SystemAdministration from "../pages/EVM/System Administration/SystemAdministraion";
import StaffController from "../pages/EVM/StaffController/StaffController";

// Profile + Auth
import Profile from "../pages/Profile/UserProfilePage";
import Authentication from "../pages/Authentication/Authentication";

// Protected wrapper
import ProtectedRoute from "../routes/ProtectedRoute";

const MainRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login KHÔNG bảo vệ */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Authentication />} />

        {/* Toàn bộ routes khác phải login */}
        <Route
          path="/*"
          element={
            // <ProtectedRoute>
            <Routes>

              <Route element={<ProtectedRoute allowedRoles={[3, 4, 1 ,2]} />}>
                {/* Dealer group */}
                <Route path="dealer" element={<DealerLayout />}>
                  <Route path="dashboard" element={<ManagerDashboard />} />
                  <Route path="vehicle-search" element={<VehicleSearch />} />
                  <Route path="contract" element={<ContractManagement />} />
                  <Route path="customer-crm" element={<CustomerCRM />} />
                  <Route path="delivery-tracking" element={<DeliveryTracking />} />
                  <Route path="driver-schedule" element={<DriverSchedule />} />
                  <Route path="quote-management" element={<QuoteManagement />} />
                  <Route path="vehicle-allocation" element={<VehicleAllocation />} />
                  <Route path="vehicle-management" element={<VehicleManagement />} />
                  <Route path="profile" element={<Profile />} />
                </Route>
              </Route>




              <Route element={<ProtectedRoute allowedRoles={[1, 2, 3, 4]} />}>
                {/* EVM group */}
                <Route path="evm" element={<EVMLayout />}>
                  <Route path="product-distribution" element={<ProductDistribution />} />
                  <Route path="dealer-management" element={<DealerManagement />} />
                  <Route path="reports-analytics" element={<ReportsAnalytics />} />
                  <Route path="system-administration" element={<SystemAdministration />} />
                  <Route path="staff-controller" element={<StaffController />} />
                </Route>

              </Route>

              {/* 404 fallback */}
              <Route path="*" element={<div className="p-6">Not Found</div>} />
            </Routes>
            // </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default MainRoutes;
