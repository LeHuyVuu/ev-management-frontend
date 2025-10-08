import React, { useState } from "react";
import CustomerList from "./components/CustomerList";
import CustomerProfile from "./components/CustomerProfile";

function CustomerCRM() {
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-6">Quản lý khách hàng</h1>
      <div className="flex">
        <div className="w-full max-w-sm mr-6">
          <CustomerList onSelectCustomer={setSelectedCustomer} />
        </div>
        <div className="flex-1 min-w-0">
          <CustomerProfile customer={selectedCustomer} />
        </div>
      </div>
    </div>
  );
}

export default CustomerCRM;
