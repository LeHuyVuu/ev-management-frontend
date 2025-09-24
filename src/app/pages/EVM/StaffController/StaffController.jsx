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
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    {
      id: "overview",
      label: "Tổng quan & EV Models",
      icon: LayoutDashboard,
      component: (
        <div className="space-y-8">
          <EVMStaffDashboard />
          <EVModelManagement />
        </div>
      ),
    },
    {
      id: "inventory",
      label: "Inventory & Orders",
      icon: Boxes,
      component: (
        <div className="space-y-8">
          <DealerInventoryStatus />
          <DistributionOrders />
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="flex-1 p-6">
        {/* Header Tabs */}
        <div className="flex gap-4 border-b mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600 font-semibold"
                    : "border-transparent text-gray-600 hover:text-blue-500"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Nội dung tab */}
        <div>{tabs.find((tab) => tab.id === activeTab)?.component}</div>
      </main>
    </div>
  );
}

export default StaffController;
