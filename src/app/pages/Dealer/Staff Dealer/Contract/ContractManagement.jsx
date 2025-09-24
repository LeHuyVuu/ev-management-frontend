import React from 'react';
import ContractHeader from './components/ContractHeader';
import ContractTable from './components/ContractTable';

function  ContractManagement() {
  return (
    <div className="min-h-screen bg-gray-50 p-5">
      <ContractHeader />
      <div className="mt-2">
        <ContractTable />
      </div>
    </div>
  );
}

export default ContractManagement;
