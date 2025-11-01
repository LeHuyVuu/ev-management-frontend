export const mockDeliveries = [
  { orderId: "mock-del-001", name: "Nguyễn Văn An", brand: "Tesla", modelName: "Model 3", color: "Trắng", deliveryAddress: "123 Lê Lợi, Q1, TP.HCM", deliveryDate: "2025-10-30", status: "delivered" },
  { orderId: "mock-del-002", name: "Trần Thị Bích", brand: "BMW", modelName: "i4", color: "Đen", deliveryAddress: "456 Nguyễn Huệ, Q1, TP.HCM", deliveryDate: "2025-10-29", status: "in_transit" },
  { orderId: "mock-del-003", name: "Lê Minh Chiến", brand: "Audi", modelName: "e-tron", color: "Xám", deliveryAddress: "789 Hàm Nghi, Q1, TP.HCM", deliveryDate: "2025-10-28", status: "out_for_delivery" },
  { orderId: "mock-del-004", name: "Phạm Văn Dũng", brand: "Mercedes", modelName: "EQC", color: "Bạc", deliveryAddress: "321 Cách Mạng 8, Q3, TP.HCM", deliveryDate: "2025-10-27", status: "arrived_hub" },
  { orderId: "mock-del-005", name: "Vũ Thị Ân", brand: "Porsche", modelName: "Taycan", color: "Đỏ", deliveryAddress: "654 Pasteur, Q1, TP.HCM", deliveryDate: "2025-10-26", status: "shipped_from_warehouse" },
];

export function getMockDeliveries() {
  return JSON.parse(JSON.stringify(mockDeliveries));
}

export function findMockDeliveryById(orderId) {
  const delivery = mockDeliveries.find(d => d.orderId === orderId);
  return delivery ? JSON.parse(JSON.stringify(delivery)) : null;
}

export function updateMockDeliveryStatus(orderId, newStatus) {
  const delivery = mockDeliveries.find(d => d.orderId === orderId);
  if (delivery) {
    delivery.status = newStatus;
    return JSON.parse(JSON.stringify(delivery));
  }
  return null;
}
