export const mockQuotes = [
  { id: "mock-q-1", customerId: "C001", customerName: "Nguyễn Văn A", vehicleId: "veh-1", vehicleName: "Tesla Model 3", dealerId: "D1", dealerName: "Tesla Hà Nội", status: "pending", amount: 800000000, createdDate: "2025-10-30" },
  { id: "mock-q-2", customerId: "C002", customerName: "Trần Thị B", vehicleId: "veh-2", vehicleName: "BMW i4", dealerId: "D2", dealerName: "BMW Sài Gòn", status: "approved", amount: 750000000, createdDate: "2025-10-29" },
  { id: "mock-q-3", customerId: "C003", customerName: "Lê Minh C", vehicleId: "veh-3", vehicleName: "Audi e-tron", dealerId: "D3", dealerName: "Audi Việt Nam", status: "rejected", amount: 850000000, createdDate: "2025-10-28" },
  { id: "mock-q-4", customerId: "C004", customerName: "Phạm Văn D", vehicleId: "veh-4", vehicleName: "Mercedes EQC", dealerId: "D1", dealerName: "Tesla Hà Nội", status: "pending", amount: 900000000, createdDate: "2025-10-27" },
  { id: "mock-q-5", customerId: "C005", customerName: "Vũ Thị E", vehicleId: "veh-5", vehicleName: "Porsche Taycan", dealerId: "D2", dealerName: "BMW Sài Gòn", status: "approved", amount: 1200000000, createdDate: "2025-10-26" },
];

export function getMockQuotes() {
  return JSON.parse(JSON.stringify(mockQuotes));
}

export function findMockQuoteById(id) {
  const quote = mockQuotes.find(q => q.id === id);
  return quote ? JSON.parse(JSON.stringify(quote)) : null;
}
