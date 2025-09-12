import React from "react";
import WholesalePriceManagement from "./components/WholesalePriceManagement";
import DiscountPolicyManagement from "./components/DiscountPolicyManagement";
import PromotionManagement from "./components/PromotionManagement";

function ProductDistribution() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <main className="flex-1 p-6 space-y-8">
          <WholesalePriceManagement />
          <DiscountPolicyManagement />
          <PromotionManagement />
        </main>
      </div>
    </div>
  );
}

export default ProductDistribution;
