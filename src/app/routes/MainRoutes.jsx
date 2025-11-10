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
import ManageVehicleAllocationTransfer from "../pages/EVM/ManageVehicleAllocationTransfer/ManageVehicleAllocationTransfer";
import Feedbacks from "../pages/Feedbacks/page";

const MainRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Authentication />} />
        <Route path="/feedbacks" element={<Feedbacks />} />

        {/* Protected routes */}
        <Route
          path="/*"
          element={
            <Routes>
              {/* Dealer group */}
              <Route element={<ProtectedRoute allowedRoles={[3, 4]} />}>
                <Route path="dealer" element={<DealerLayout />}>
                  {/* chỉ role 3 mới vào được dashboard */}
                  <Route
                    path="dashboard"
                    element={
                      <ProtectedRoute allowedRoles={[3]}>
                        <ManagerDashboard />
                      </ProtectedRoute>
                    }
                  />

                  <Route path="vehicle-search" element={<VehicleSearch />} />
                  <Route path="contract" element={<ContractManagement />} />
                  <Route path="customer-crm" element={<CustomerCRM />} />
                  <Route path="delivery-tracking" element={<DeliveryTracking />} />
                  <Route path="driver-schedule" element={<DriverSchedule />} />
                  <Route path="quote-management" element={<QuoteManagement />} />
                  <Route path="vehicle-allocation" element={<VehicleAllocation />} />
                  <Route path="vehicle-management" element={<VehicleManagement />} />
                  <Route path="profile" element={<Profile />} />

                  {/* fallback nếu role khác cố truy cập dashboard */}
                  <Route
                    path="dashboard/*"
                    element={<Navigate to="/dealer/vehicle-search" replace />}
                  />
                </Route>
              </Route>

              {/* EVM group */}
              <Route element={<ProtectedRoute allowedRoles={[1, 2]} />}>
                <Route path="evm" element={<EVMLayout />}>
                  <Route path="product-distribution" element={<ProductDistribution />} />
                  <Route path="dealer-management" element={<DealerManagement />} />
                  <Route path="reports-analytics" element={<ReportsAnalytics />} />
                  <Route path="system-administration" element={<SystemAdministration />} />
                  <Route path="staff-controller" element={<StaffController />} />
                  <Route
                    path="vehicle-allocation-transfer"
                    element={<ManageVehicleAllocationTransfer />}
                  />
                </Route>
              </Route>

              {/* 404 fallback */}
              <Route path="*" element={<div className="p-6">Not Found</div>} />
            </Routes>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default MainRoutes;
