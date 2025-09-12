import React from "react";
import SalesReport from "./components/SalesReport";
import InventoryAndSpeed from "./components/InventoryAndSpeed";
import AIForecast from "./components/AIForecast";

function ReportsManagement() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <main className="flex-1 p-6 space-y-8">
          <SalesReport />
          <InventoryAndSpeed />
          <AIForecast />
        </main>
      </div>
    </div>
  );
}

export default ReportsManagement;
