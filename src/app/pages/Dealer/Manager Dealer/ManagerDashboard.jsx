

import React from 'react';

import DashboardStats from './components/DashboardStats';
import Sidebar from '../../../layouts/Sidebar/DealerSidebar.jsx';
import MonthlyRevenueChart from './components/MonthlyRevenueChart';
import EmployeeSalesTable from './components/EmployeeSalesTable';
import CarSalesChart from './components/CarSalesChart';
import QuarterlyTargetProgress from './components/QuarterlyTargetProgress';
import CustomerDebtReport from './components/CustomerDebtReport.jsx';
import ManufacturerDebtReport from './components/ManufacturerDebtReport';


function ManagerDashboard() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Main content */}
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Tổng quan Dashboard</h1>
        <DashboardStats />
        {/* Row with MonthlyRevenueChart (left) and EmployeeSalesTable (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <MonthlyRevenueChart />
          <EmployeeSalesTable />
        </div>
        {/* Row with CarSalesChart (left) and QuarterlyTargetProgress (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <CarSalesChart />
          <QuarterlyTargetProgress />
        </div>
        {/* Row with CustomerDebtReport (left) and ManufacturerDebtReport (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <CustomerDebtReport />
          <ManufacturerDebtReport />
        </div>
      </main>
    </div>
  );
}

export default ManagerDashboard
