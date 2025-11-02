import React, { useState } from "react";
import { TrendingUp, Brain } from "lucide-react";

// Nếu hai component này tồn tại, giữ lại import.
// Nếu không có, có thể tạm ẩn tab hoặc xoá import.
import SalesReport from "./components/SalesReport";
import InventoryAndSpeed from "./components/InventoryAndSpeed";

// Tách AIForecast ra file riêng và import vào đây
import AIForecast from "./components/AIForecast";

function ReportsAnalytics() {
  const [activeTab, setActiveTab] = useState("sales-inventory");

  const tabs = [
    {
      id: "sales-inventory",
      label: "Sales & Inventory",
      icon: TrendingUp,
      component: (
        <div className="space-y-8">
          <SalesReport />
          <InventoryAndSpeed />
        </div>
      ),
    },
    {
      id: "forecast",
      label: "AI Forecast",
      icon: Brain,
      component: <AIForecast />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="flex-1 p-6">
        {/* Header Tabs */}
        <div className="flex gap-4 border-b mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon; // ✅ JSX: bỏ "as any"
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg border-b-2 transition-colors ${
                  active
                    ? "border-blue-600 text-blue-600 font-semibold"
                    : "border-transparent text-gray-600 hover:text-blue-500"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-blue-600" : "text-gray-500"}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div>{tabs.find((tab) => tab.id === activeTab)?.component}</div>
      </main>
    </div>
  );
}

export default ReportsAnalytics;
