import React from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import WholesalePriceManagement from "./components/WholesalePriceManagement";
import DiscountPolicyManagement from "./components/DiscountPolicyManagement";
import PromotionManagement from "./components/PromotionManagement";
import Footer from "./components/Footer";

function ProductDistribution() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 space-y-8">
          <WholesalePriceManagement />
          <DiscountPolicyManagement />
          <PromotionManagement />
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default ProductDistribution;
