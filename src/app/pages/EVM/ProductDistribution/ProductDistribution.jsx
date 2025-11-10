import React, { useState } from "react";
import { DollarSign, Percent, Gift } from "lucide-react";

import WholesalePriceManagement from "./components/WholesalePriceManagement";
import DiscountPolicyManagement from "./components/DiscountPolicyManagement";
import PromotionManagement from "./components/PromotionManagement";

function ProductDistribution() {
  const [activeTab, setActiveTab] = useState("wholesale");

  const tabs = [
    {
      id: "wholesale",
      label: "Wholesale Price",
      icon: DollarSign,
      component: <WholesalePriceManagement />,
    },
    {
      id: "discount",
      label: "Discount Policy",
      icon: Percent,
      component: <DiscountPolicyManagement />,
    },
    {
      id: "promotion",
      label: "Promotion",
      icon: Gift,
      component: <PromotionManagement />,
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
        <div className="space-y-6">
          {tabs.find((tab) => tab.id === activeTab)?.component}
        </div>
      </main>
    </div>
  );
}

export default ProductDistribution;
