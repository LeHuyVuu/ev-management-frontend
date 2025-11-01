export const mockContracts = [
  { id: "mock-contract-1", customerId: "C1", customerName: "Nguyễn Văn A", vehicleId: "veh-1", vehicleName: "Tesla Model 3", dealerName: "Tesla Hà Nội", status: "confirmed", signedDate: "2025-10-30", totalValue: 800000000 },
  { id: "mock-contract-2", customerId: "C2", customerName: "Trần Thị B", vehicleId: "veh-2", vehicleName: "BMW i4", dealerName: "BMW Sài Gòn", status: "approved", signedDate: "2025-10-29", totalValue: 750000000 },
  { id: "mock-contract-3", customerId: "C3", customerName: "Lê Minh C", vehicleId: "veh-3", vehicleName: "Audi e-tron", dealerName: "Audi Việt Nam", status: "draft", signedDate: "2025-10-28", totalValue: 850000000 },
  { id: "mock-contract-4", customerId: "C4", customerName: "Phạm Văn D", vehicleId: "veh-4", vehicleName: "Mercedes EQC", dealerName: "Tesla Hà Nội", status: "confirmed", signedDate: "2025-10-27", totalValue: 900000000 },
  { id: "mock-contract-5", customerId: "C5", customerName: "Vũ Thị E", vehicleId: "veh-5", vehicleName: "Porsche Taycan", dealerName: "BMW Sài Gòn", status: "approved", signedDate: "2025-10-26", totalValue: 1200000000 },
];

export function getMockContracts() {
  return JSON.parse(JSON.stringify(mockContracts));
}

export function findMockContractById(id) {
  const contract = mockContracts.find(c => c.id === id);
  return contract ? JSON.parse(JSON.stringify(contract)) : null;
}

export function updateMockContractStatus(id, newStatus) {
  const contract = mockContracts.find(c => c.id === id);
  if (contract) {
    contract.status = newStatus;
    return JSON.parse(JSON.stringify(contract));
  }
  return null;
}
