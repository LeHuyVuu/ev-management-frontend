import React, { useState } from "react";
import { LayoutDashboard, BarChart3 } from "lucide-react";

import DashboardStats from "./components/DashboardStats";
import Sidebar from "../../../layouts/Sidebar/DealerSidebar.jsx";
import MonthlyRevenueChart from "./components/MonthlyRevenueChart";
import EmployeeSalesTable from "./components/EmployeeSalesTable";
import CarSalesChart from "./components/CarSalesChart";
import QuarterlyTargetProgress from "./components/QuarterlyTargetProgress";
import CustomerDebtReport from "./components/CustomerDebtReport.jsx";
import ManufacturerDebtReport from "./components/ManufacturerDebtReport";

function ManagerDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    {
      id: "overview",
      label: "Tổng quan & Doanh thu",
      icon: LayoutDashboard,
      component: (
        <>
          {/* Tổng quan */}
          <DashboardStats />
          {/* Doanh thu */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <MonthlyRevenueChart />
            <EmployeeSalesTable />
          </div>
        </>
      ),
    },
    {
      id: "sales-debt",
      label: "Bán hàng & Công nợ",
      icon: BarChart3,
      component: (
        <>
          {/* Bán hàng */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <CarSalesChart />
            <QuarterlyTargetProgress />
          </div>
          {/* Công nợ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <CustomerDebtReport />
            <ManufacturerDebtReport />
          </div>
        </>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar nếu cần */}
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Dashboard Quản lý</h1>

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

export default ManagerDashboard;
