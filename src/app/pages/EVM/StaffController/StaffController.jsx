import React, { useState } from "react";
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
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="flex-1 p-6">
        <div className="space-y-8">
          {/* Dashboard nhận key để re-fetch */}
          <EVMStaffDashboard refreshKey={refreshKey} />

          {/* Khi thêm mới model xong, trigger tăng key */}
          <EVModelManagement onModelAdded={() => setRefreshKey(prev => prev + 1)} />
        </div>
      </main>
    </div>
  );
}


export default StaffController;
