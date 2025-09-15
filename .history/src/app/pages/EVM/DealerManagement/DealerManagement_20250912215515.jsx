import React from "react";
import DealerAccounts from "./components/DealerAccounts";
import ContractsAndDebts from "./components/ContractsAndDebts";
import SalesTargets from "./components/SalesTargets";

function DealerManagement() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <main className="flex-1 p-6 space-y-8">
          {/* Dealer Accounts Section */}
          <DealerAccounts />

          {/* Contracts & Debts Section */}
          <ContractsAndDebts />

          {/* Sales Targets Section */}
          <SalesTargets />
        </main>
      </div>
    </div>
  );
}

export default DealerManagement;
