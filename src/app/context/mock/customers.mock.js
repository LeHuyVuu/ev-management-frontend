export const mockCustomers = [
  { id: "mock-cust-1", name: "Nguyễn Văn A", email: "nguyen.a@email.com", phone: "0912345678", address: "123 Lê Lợi, Q1, TP.HCM" },
  { id: "mock-cust-2", name: "Trần Thị B", email: "tran.b@email.com", phone: "0987654321", address: "456 Nguyễn Huệ, Q1, TP.HCM" },
  { id: "mock-cust-3", name: "Lê Minh C", email: "le.c@email.com", phone: "0909876543", address: "789 Hàm Nghi, Q1, TP.HCM" },
  { id: "mock-cust-4", name: "Phạm Văn D", email: "pham.d@email.com", phone: "0901234567", address: "321 Cách Mạng 8, Q3, TP.HCM" },
  { id: "mock-cust-5", name: "Vũ Thị E", email: "vu.e@email.com", phone: "0934567890", address: "654 Pasteur, Q1, TP.HCM" },
];

export function getMockCustomers() {
  return JSON.parse(JSON.stringify(mockCustomers));
}

export function findMockCustomerById(id) {
  const customer = mockCustomers.find(c => c.id === id);
  return customer ? JSON.parse(JSON.stringify(customer)) : null;
}
