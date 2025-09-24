import React, { useState } from "react";
import { Users, FileBarChart, Target, ClipboardList } from "lucide-react";

import DealerAccounts from "./components/DealerAccounts";
import ContractsAndDebts from "./components/ContractsAndDebts";
import SalesTargets from "./components/SalesTargets";
import OrderDistribution from "./components/OrderDistribution";

function DealerManagement() {
  const [activeTab, setActiveTab] = useState("dealer-contracts");

  const tabs = [
    {
      id: "dealer-contracts",
      label: "Dealer & Contracts",
      icon: Users,
      component: (
        <div className="space-y-8">
          <DealerAccounts />
          <ContractsAndDebts />
        </div>
      ),
    },
    {
      id: "targets-orders",
      label: "Targets & Orders",
      icon: Target,
      component: (
        <div className="space-y-8">
          <SalesTargets />
          <OrderDistribution />
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

export default DealerManagement;
