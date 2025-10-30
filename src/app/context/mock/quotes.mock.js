// Helper: Generate GUID v4 format
function generateGUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Real Vietnamese customer names
const customerNames = [
  "Nguyễn Văn An", "Trần Thị Ánh", "Lê Minh Anh", "Phạm Văn Bảo", "Vũ Thị Bích",
  "Đặng Minh Bình", "Bùi Thị Cẩm", "Hoàng Văn Chính", "Vương Thị Chương", "Tôn Văn Công",
  "Quách Thị Dạ", "Nông Văn Đại", "Tạ Thị Đan", "Bảo Văn Đức", "Thủy Thị Dương",
  "Hưng Văn Định", "Linh Thị Điệu", "Tiến Văn Diệp", "Hương Thị Duyên", "Toàn Văn Duyệt",
  "Thục Thị Duyên", "Tùng Văn Gia", "Tuyết Thị Giáng", "Uy Văn Giang", "Uyên Thị Giáp",
  "Văn Văn Giao", "Trang Thị Hà", "Thành Văn Hải", "Thanh Thị Hạnh", "Tâm Văn Hùng",
  "Tuyền Thị Hương", "Tuấn Văn Hưởng", "Tú Thị Huyền", "Uy Văn Huy", "Uyển Thị Huyệt",
  "Viên Văn Hùng", "Yến Thị Hương", "Ưu Văn Hỷ", "Tuệ Thị Hồ", "Trực Văn Hoài",
  "Trúc Thị Hoàn", "Trương Văn Hoài", "Triệu Thị Hoàn", "Tùng Văn Hoàng", "Trang Thị Huyền",
  "Tâm Văn Hải", "Thảo Thị Hà", "Tuấn Văn Hùng", "Tuyên Thị Hương", "Thắng Văn Hiến"
];

const vehicleNames = [
  "Tesla Model 3", "BMW i4", "Audi e-tron", "Mercedes EQC", "Porsche Taycan",
  "Tesla Model Y", "BMW i3", "Jaguar I-PACE", "Hyundai Kona Electric", "Kia EV6",
  "Tesla Model S", "Volkswagen ID.4", "MG5 EV", "Nissan Leaf", "Renault Zoe",
  "Tesla Model X", "Aston Martin DBX", "Bentley Bentayga", "Polestar 1", "Lucid Air",
  "Rivian R1T", "Tesla Model 3", "BMW i7", "Audi Q4 e-tron", "Mercedes EQE",
  "Porsche Taycan Cross Turismo", "Tesla Roadster", "Xpeng G9", "Li Auto ONE", "BYD Yuan Plus",
  "Tesla Model 3", "BMW i4 eDrive40", "Audi e-tron GT", "Hyundai Ioniq 5", "Kia Niro EV",
  "Volkswagen ID.5", "Tesla Model Y Long Range", "BMW X5 xDrive50e", "Audi Q7 TFSI e", "Porsche 911 Turbo S E-Hybrid",
  "Mercedes-AMG EQS 53 4MATIC+", "Tesla Model S Long Range", "Jaguar I-PACE EV400", "Hyundai Tucson Plug-in Hybrid", "Kia Sorento Plug-in Hybrid",
  "BMW i5", "Audi Q5 TFSI e", "Tesla Model 3 Performance", "BMW M440i xDrive", "Audi S4 Avant TFSI e"
];

const statuses = ["pending", "approved", "rejected"];
const dealerNames = ["Tesla Hà Nội", "BMW Sài Gòn", "Audi Việt Nam"];

export const mockQuotes = customerNames.map((name, index) => ({
  id: generateGUID(),
  customerId: generateGUID(),
  customerName: name,
  vehicleId: generateGUID(),
  vehicleName: vehicleNames[index % vehicleNames.length],
  dealerId: generateGUID(),
  dealerName: dealerNames[index % dealerNames.length],
  status: statuses[index % statuses.length],
  amount: Math.floor(500000000 + Math.random() * 2500000000),
  createdDate: new Date(2025, 8, 11 + Math.floor(index / 5)).toISOString().split('T')[0],
}));

export function getMockQuotes() {
  return JSON.parse(JSON.stringify(mockQuotes));
}

export function findMockQuoteById(id) {
  const quote = mockQuotes.find(q => q.id === id);
  return quote ? JSON.parse(JSON.stringify(quote)) : null;
}
