import React from "react";
import EVMStaffDashboard from "./components/EVMStaffDashboard";
import EVModelManagement from "./components/EVModelManagement";
import DealerInventoryStatus from "./components/DealerInventoryStatus";
import DistributionOrders from "./components/DistributionOrders";

function StaffController() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <main className="flex-1 p-6 space-y-8">
          {/* Dashboard Overview */}
          <EVMStaffDashboard />

          {/* EV Model Management */}
          <EVModelManagement />

          {/* Dealer Inventory Status */}
          <DealerInventoryStatus />

          {/* Distribution Orders */}
          <DistributionOrders />
        </main>
      </div>
    </div>
  );
}

export default StaffController;
