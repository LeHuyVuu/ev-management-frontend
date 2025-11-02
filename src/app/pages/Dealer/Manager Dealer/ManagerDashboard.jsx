import React from "react";
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
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar nếu cần */}
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Dashboard Quản lý</h1>

        {/* Tổng quan */}
        <DashboardStats />

        {/* Biểu đồ & Bảng */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <MonthlyRevenueChart />
          <EmployeeSalesTable />
        </div>
      </main>
    </div>
  );
}

export default ManagerDashboard;
