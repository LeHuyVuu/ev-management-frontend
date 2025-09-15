import React from 'react';
import AllocationRequest from './components/AllocationRequest';
import AllocationRequestsList from './components/AllocationRequestsList';

function VehicleAllocation() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-6">Yêu cầu phân bổ xe</h1>
      <div className="mb-4">
        <AllocationRequest />
      </div>
      <AllocationRequestsList />
    </div>
  );
}

export default VehicleAllocation;
