import React from "react";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Boxes,
} from "lucide-react";

import EVMStaffDashboard from "./components/EVMStaffDashboard";
import EVModelManagement from "./components/EVModelManagement";
import DealerInventoryStatus from "./components/DealerInventoryStatus";
import DistributionOrders from "./components/DistributionOrders";

function StaffController() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="flex-1 p-6">
        <div className="space-y-8">
          {/* Tổng quan & EV Models */}
          <EVMStaffDashboard />
          <EVModelManagement />

        </div>
      </main>
    </div>
  );
}

export default StaffController;
