/**/**// Synthetic mock dataset for vehicle versions (50 items)

 * Mock vehicles data for Vehicle Search

 */ * Mock vehicles data for Vehicle Search// Shape matches API items used in CarList: {



const mockVehicles = [ *///   vehicleVersionId, vehicleId, brand, modelName, versionName,

  { id: "mock-veh-001", name: "Tesla Model 3", brand: "Tesla", model: "Model 3", price: "800000000", status: "available", image: "https://images.unsplash.com/photo-1560958089-b8a63eead8cb?w=500" },

  { id: "mock-veh-002", name: "Tesla Model Y", brand: "Tesla", model: "Model Y", price: "950000000", status: "available", image: "https://images.unsplash.com/photo-1617469762185-7e4ee4da7eaf?w=500" },//   basePrice, color, evType, horsePower, stockQuantity, imageUrl

  { id: "mock-veh-003", name: "BMW i3", brand: "BMW", model: "i3", price: "600000000", status: "available", image: "https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=500" },

  { id: "mock-veh-004", name: "BMW i4", brand: "BMW", model: "i4", price: "750000000", status: "available", image: "https://images.unsplash.com/photo-1617469762185-7e4ee4da7eaf?w=500" },const mockVehicles = [// }

  { id: "mock-veh-005", name: "Audi e-tron", brand: "Audi", model: "e-tron", price: "850000000", status: "available", image: "https://images.unsplash.com/photo-1553882900-f2b06423b350?w=500" },

  { id: "mock-veh-006", name: "Mercedes EQC", brand: "Mercedes", model: "EQC", price: "900000000", status: "available", image: "https://images.unsplash.com/photo-1549399542-7e3f8b83ad5e?w=500" },  { id: "mock-veh-001", name: "Tesla Model 3", brand: "Tesla", model: "Model 3", price: "800000000", status: "available", image: "https://images.unsplash.com/photo-1560958089-b8a63eead8cb?w=500" },

  { id: "mock-veh-007", name: "Porsche Taycan", brand: "Porsche", model: "Taycan", price: "1200000000", status: "available", image: "https://images.unsplash.com/photo-1577818946779-4e5de60bd017?w=500" },

  { id: "mock-veh-008", name: "Hyundai Ioniq 5", brand: "Hyundai", model: "Ioniq 5", price: "550000000", status: "available", image: "https://images.unsplash.com/photo-1590362891990-f8ddb41d54e0?w=500" },  { id: "mock-veh-002", name: "Tesla Model Y", brand: "Tesla", model: "Model Y", price: "950000000", status: "available", image: "https://images.unsplash.com/photo-1617469762185-7e4ee4da7eaf?w=500" },const BRANDS = [

  { id: "mock-veh-009", name: "Kia EV6", brand: "Kia", model: "EV6", price: "600000000", status: "available", image: "https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=500" },

  { id: "mock-veh-010", name: "Nissan Leaf", brand: "Nissan", model: "Leaf", price: "450000000", status: "available", image: "https://images.unsplash.com/photo-1560958089-b8a63eead8cb?w=500" },  { id: "mock-veh-003", name: "BMW i3", brand: "BMW", model: "i3", price: "600000000", status: "available", image: "https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=500" },  { brand: "VinFast", models: ["VF 5", "VF 6", "VF 7", "VF 8", "VF 9"] },

  { id: "mock-veh-011", name: "Volkswagen ID.4", brand: "Volkswagen", model: "ID.4", price: "650000000", status: "available", image: "https://images.unsplash.com/photo-1617469762185-7e4ee4da7eaf?w=500" },

  { id: "mock-veh-012", name: "Ford Mustang Mach-E", brand: "Ford", model: "Mustang Mach-E", price: "700000000", status: "available", image: "https://images.unsplash.com/photo-1553882900-f2b06423b350?w=500" },  { id: "mock-veh-004", name: "BMW i4", brand: "BMW", model: "i4", price: "750000000", status: "available", image: "https://images.unsplash.com/photo-1617469762185-7e4ee4da7eaf?w=500" },  { brand: "Tesla", models: ["Model 3", "Model Y", "Model S", "Model X"] },

  { id: "mock-veh-013", name: "Chevrolet Bolt EV", brand: "Chevrolet", model: "Bolt EV", price: "550000000", status: "available", image: "https://images.unsplash.com/photo-1549399542-7e3f8b83ad5e?w=500" },

  { id: "mock-veh-014", name: "Fiat 500e", brand: "Fiat", model: "500e", price: "480000000", status: "available", image: "https://images.unsplash.com/photo-1577818946779-4e5de60bd017?w=500" },  { id: "mock-veh-005", name: "Audi e-tron", brand: "Audi", model: "e-tron", price: "850000000", status: "available", image: "https://images.unsplash.com/photo-1553882900-f2b06423b350?w=500" },  { brand: "Hyundai", models: ["Ioniq 5", "Ioniq 6", "Kona Electric"] },

  { id: "mock-veh-015", name: "Renault Zoe", brand: "Renault", model: "Zoe", price: "420000000", status: "available", image: "https://images.unsplash.com/photo-1590362891990-f8ddb41d54e0?w=500" },

  { id: "mock-veh-016", name: "Peugeot e-208", brand: "Peugeot", model: "e-208", price: "500000000", status: "available", image: "https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=500" },  { id: "mock-veh-006", name: "Mercedes EQC", brand: "Mercedes", model: "EQC", price: "900000000", status: "available", image: "https://images.unsplash.com/photo-1549399542-7e3f8b83ad5e?w=500" },  { brand: "Kia", models: ["EV6", "EV9", "Niro EV"] },

  { id: "mock-veh-017", name: "Opel Corsa-e", brand: "Opel", model: "Corsa-e", price: "450000000", status: "available", image: "https://images.unsplash.com/photo-1560958089-b8a63eead8cb?w=500" },

  { id: "mock-veh-018", name: "MG ZS EV", brand: "MG", model: "ZS EV", price: "400000000", status: "available", image: "https://images.unsplash.com/photo-1617469762185-7e4ee4da7eaf?w=500" },  { id: "mock-veh-007", name: "Porsche Taycan", brand: "Porsche", model: "Taycan", price: "1200000000", status: "available", image: "https://images.unsplash.com/photo-1577818946779-4e5de60bd017?w=500" },  { brand: "BMW", models: ["i3", "i4", "iX1", "iX3", "iX"] },

  { id: "mock-veh-019", name: "BYD Yuan Plus", brand: "BYD", model: "Yuan Plus", price: "550000000", status: "available", image: "https://images.unsplash.com/photo-1553882900-f2b06423b350?w=500" },

  { id: "mock-veh-020", name: "JAC iEV7S", brand: "JAC", model: "iEV7S", price: "380000000", status: "available", image: "https://images.unsplash.com/photo-1549399542-7e3f8b83ad5e?w=500" },  { id: "mock-veh-008", name: "Hyundai Ioniq 5", brand: "Hyundai", model: "Ioniq 5", price: "550000000", status: "available", image: "https://images.unsplash.com/photo-1590362891990-f8ddb41d54e0?w=500" },  { brand: "Mercedes", models: ["EQA", "EQB", "EQE", "EQS"] },

  { id: "mock-veh-021", name: "Geely GE11", brand: "Geely", model: "GE11", price: "420000000", status: "available", image: "https://images.unsplash.com/photo-1577818946779-4e5de60bd017?w=500" },

  { id: "mock-veh-022", name: "Lifan Seagull", brand: "Lifan", model: "Seagull", price: "350000000", status: "available", image: "https://images.unsplash.com/photo-1590362891990-f8ddb41d54e0?w=500" },  { id: "mock-veh-009", name: "Kia EV6", brand: "Kia", model: "EV6", price: "600000000", status: "available", image: "https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=500" },  { brand: "Audi", models: ["Q4 e-tron", "Q8 e-tron", "e-tron GT"] },

  { id: "mock-veh-023", name: "Great Wall ORA", brand: "Great Wall", model: "ORA", price: "460000000", status: "available", image: "https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=500" },

  { id: "mock-veh-024", name: "Dongfeng Yuan", brand: "Dongfeng", model: "Yuan", price: "580000000", status: "available", image: "https://images.unsplash.com/photo-1560958089-b8a63eead8cb?w=500" },  { id: "mock-veh-010", name: "Nissan Leaf", brand: "Nissan", model: "Leaf", price: "450000000", status: "available", image: "https://images.unsplash.com/photo-1560958089-b8a63eead8cb?w=500" },  { brand: "BYD", models: ["Atto 3", "Dolphin", "Seal"] },

  { id: "mock-veh-025", name: "Roewe Ei5", brand: "Roewe", model: "Ei5", price: "500000000", status: "available", image: "https://images.unsplash.com/photo-1617469762185-7e4ee4da7eaf?w=500" },

  { id: "mock-veh-026", name: "Changan Benben", brand: "Changan", model: "Benben", price: "360000000", status: "available", image: "https://images.unsplash.com/photo-1553882900-f2b06423b350?w=500" },  { id: "mock-veh-011", name: "Volkswagen ID.4", brand: "Volkswagen", model: "ID.4", price: "650000000", status: "available", image: "https://images.unsplash.com/photo-1617469762185-7e4ee4da7eaf?w=500" },  { brand: "Nissan", models: ["Leaf", "Ariya"] },

  { id: "mock-veh-027", name: "Ora Black Cat", brand: "Ora", model: "Black Cat", price: "380000000", status: "available", image: "https://images.unsplash.com/photo-1549399542-7e3f8b83ad5e?w=500" },

  { id: "mock-veh-028", name: "Seagull D1", brand: "Seagull", model: "D1", price: "340000000", status: "available", image: "https://images.unsplash.com/photo-1577818946779-4e5de60bd017?w=500" },  { id: "mock-veh-012", name: "Ford Mustang Mach-E", brand: "Ford", model: "Mustang Mach-E", price: "700000000", status: "available", image: "https://images.unsplash.com/photo-1553882900-f2b06423b350?w=500" },  { brand: "Toyota", models: ["bZ4X", "C-HR EV"] },

  { id: "mock-veh-029", name: "Geometry C", brand: "Geometry", model: "C", price: "420000000", status: "available", image: "https://images.unsplash.com/photo-1590362891990-f8ddb41d54e0?w=500" },

  { id: "mock-veh-030", name: "Aion S", brand: "Aion", model: "S", price: "480000000", status: "available", image: "https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=500" },  { id: "mock-veh-013", name: "Chevrolet Bolt EV", brand: "Chevrolet", model: "Bolt EV", price: "550000000", status: "available", image: "https://images.unsplash.com/photo-1549399542-7e3f8b83ad5e?w=500" },];

  { id: "mock-veh-031", name: "ZS EV", brand: "ZS", model: "EV", price: "400000000", status: "available", image: "https://images.unsplash.com/photo-1560958089-b8a63eead8cb?w=500" },

  { id: "mock-veh-032", name: "Icon iX", brand: "Icon", model: "iX", price: "650000000", status: "available", image: "https://images.unsplash.com/photo-1617469762185-7e4ee4da7eaf?w=500" },  { id: "mock-veh-014", name: "Fiat 500e", brand: "Fiat", model: "500e", price: "480000000", status: "available", image: "https://images.unsplash.com/photo-1577818946779-4e5de60bd017?w=500" },

  { id: "mock-veh-033", name: "Jidu ROBO", brand: "Jidu", model: "ROBO", price: "700000000", status: "available", image: "https://images.unsplash.com/photo-1553882900-f2b06423b350?w=500" },

  { id: "mock-veh-034", name: "Luxeed S7", brand: "Luxeed", model: "S7", price: "800000000", status: "available", image: "https://images.unsplash.com/photo-1549399542-7e3f8b83ad5e?w=500" },  { id: "mock-veh-015", name: "Renault Zoe", brand: "Renault", model: "Zoe", price: "420000000", status: "available", image: "https://images.unsplash.com/photo-1590362891990-f8ddb41d54e0?w=500" },const COLORS = ["Đen", "Trắng", "Xám", "Đỏ", "Xanh", "Bạc", "Xanh lá", "Vàng"];

  { id: "mock-veh-035", name: "Nio ET5", brand: "Nio", model: "ET5", price: "950000000", status: "available", image: "https://images.unsplash.com/photo-1577818946779-4e5de60bd017?w=500" },

  { id: "mock-veh-036", name: "Os Atto 3", brand: "Os", model: "Atto 3", price: "620000000", status: "available", image: "https://images.unsplash.com/photo-1590362891990-f8ddb41d54e0?w=500" },  { id: "mock-veh-016", name: "Peugeot e-208", brand: "Peugeot", model: "e-208", price: "500000000", status: "available", image: "https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=500" },const TYPES = ["SUV", "Sedan", "Hatchback", "Crossover", "Pickup"];

  { id: "mock-veh-037", name: "Pilot EV2", brand: "Pilot", model: "EV2", price: "540000000", status: "available", image: "https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=500" },

  { id: "mock-veh-038", name: "Qv Gold", brand: "Qv", model: "Gold", price: "480000000", status: "available", image: "https://images.unsplash.com/photo-1560958089-b8a63eead8cb?w=500" },  { id: "mock-veh-017", name: "Opel Corsa-e", brand: "Opel", model: "Corsa-e", price: "450000000", status: "available", image: "https://images.unsplash.com/photo-1560958089-b8a63eead8cb?w=500" },

  { id: "mock-veh-039", name: "Roewe Ri6", brand: "Roewe", model: "Ri6", price: "520000000", status: "available", image: "https://images.unsplash.com/photo-1617469762185-7e4ee4da7eaf?w=500" },

  { id: "mock-veh-040", name: "Sung EV1", brand: "Sung", model: "EV1", price: "450000000", status: "available", image: "https://images.unsplash.com/photo-1553882900-f2b06423b350?w=500" },  { id: "mock-veh-018", name: "MG ZS EV", brand: "MG", model: "ZS EV", price: "400000000", status: "available", image: "https://images.unsplash.com/photo-1617469762185-7e4ee4da7eaf?w=500" },// Realistic EV car images from Unsplash (high-quality, free license)

  { id: "mock-veh-041", name: "Tai EV", brand: "Tai", model: "EV", price: "420000000", status: "available", image: "https://images.unsplash.com/photo-1549399542-7e3f8b83ad5e?w=500" },

  { id: "mock-veh-042", name: "Uno Mille", brand: "Uno", model: "Mille", price: "380000000", status: "available", image: "https://images.unsplash.com/photo-1577818946779-4e5de60bd017?w=500" },  { id: "mock-veh-019", name: "BYD Yuan Plus", brand: "BYD", model: "Yuan Plus", price: "550000000", status: "available", image: "https://images.unsplash.com/photo-1553882900-f2b06423b350?w=500" },const REAL_EV_IMAGES = [

  { id: "mock-veh-043", name: "Venucia D60", brand: "Venucia", model: "D60", price: "500000000", status: "available", image: "https://images.unsplash.com/photo-1590362891990-f8ddb41d54e0?w=500" },

  { id: "mock-veh-044", name: "Wan N01", brand: "Wan", model: "N01", price: "460000000", status: "available", image: "https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=500" },  { id: "mock-veh-020", name: "JAC iEV7S", brand: "JAC", model: "iEV7S", price: "380000000", status: "available", image: "https://images.unsplash.com/photo-1549399542-7e3f8b83ad5e?w=500" },  "https://images.unsplash.com/photo-1739565862754-96e5c6569033?w=640&h=360&fit=crop", // Close-up mirror (electric car)

  { id: "mock-veh-045", name: "Xev Yoyo", brand: "Xev", model: "Yoyo", price: "400000000", status: "available", image: "https://images.unsplash.com/photo-1560958089-b8a63eead8cb?w=500" },

  { id: "mock-veh-046", name: "Zotye Dajin", brand: "Zotye", model: "Dajin", price: "420000000", status: "available", image: "https://images.unsplash.com/photo-1617469762185-7e4ee4da7eaf?w=500" },  { id: "mock-veh-021", name: "Geely GE11", brand: "Geely", model: "GE11", price: "420000000", status: "available", image: "https://images.unsplash.com/photo-1577818946779-4e5de60bd017?w=500" },  "https://images.unsplash.com/photo-1739565862751-cb36e75d1c61?w=640&h=360&fit=crop", // Grey Volvo driving

  { id: "mock-veh-047", name: "XPeng G3", brand: "XPeng", model: "G3", price: "680000000", status: "available", image: "https://images.unsplash.com/photo-1553882900-f2b06423b350?w=500" },

  { id: "mock-veh-048", name: "Wuling Hongguang", brand: "Wuling", model: "Hongguang", price: "350000000", status: "available", image: "https://images.unsplash.com/photo-1549399542-7e3f8b83ad5e?w=500" },  { id: "mock-veh-022", name: "Lifan Seagull", brand: "Lifan", model: "Seagull", price: "350000000", status: "available", image: "https://images.unsplash.com/photo-1590362891990-f8ddb41d54e0?w=500" },  "https://images.unsplash.com/photo-1751553512991-7ae218946be9?w=640&h=360&fit=crop", // EV charging at station

  { id: "mock-veh-049", name: "Chery QQ", brand: "Chery", model: "QQ", price: "360000000", status: "available", image: "https://images.unsplash.com/photo-1577818946779-4e5de60bd017?w=500" },

  { id: "mock-veh-050", name: "Li Auto ONE", brand: "Li Auto", model: "ONE", price: "1100000000", status: "available", image: "https://images.unsplash.com/photo-1590362891990-f8ddb41d54e0?w=500" },  { id: "mock-veh-023", name: "Great Wall ORA Good Cat", brand: "Great Wall", model: "ORA Good Cat", price: "460000000", status: "available", image: "https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=500" },  "https://images.unsplash.com/photo-1698653222628-413b30474cc5?w=640&h=360&fit=crop", // Steering wheel dashboard

];

  { id: "mock-veh-024", name: "Dongfeng Yuan Plus", brand: "Dongfeng", model: "Yuan Plus", price: "580000000", status: "available", image: "https://images.unsplash.com/photo-1560958089-b8a63eead8cb?w=500" },  "https://images.unsplash.com/photo-1651688730796-151972ba8f87?w=640&h=360&fit=crop", // Car with charging cable

export function getMockVehicles() {

  return JSON.parse(JSON.stringify(mockVehicles));  { id: "mock-veh-025", name: "Roewe Ei5", brand: "Roewe", model: "Ei5", price: "500000000", status: "available", image: "https://images.unsplash.com/photo-1617469762185-7e4ee4da7eaf?w=500" },  "https://images.unsplash.com/photo-1629056970742-eb810a6f2a4c?w=640&h=360&fit=crop", // Tesla chargers at service plaza

}

  { id: "mock-veh-026", name: "Changan Benben EV", brand: "Changan", model: "Benben EV", price: "360000000", status: "available", image: "https://images.unsplash.com/photo-1553882900-f2b06423b350?w=500" },  "https://images.unsplash.com/photo-1615829386703-e2bb66a7cb7d?w=640&h=360&fit=crop", // White and black car EV charging

export function findMockVehicleById(id) {

  const vehicle = mockVehicles.find((v) => v.id === id);  { id: "mock-veh-027", name: "Ora Black Cat", brand: "Ora", model: "Black Cat", price: "380000000", status: "available", image: "https://images.unsplash.com/photo-1549399542-7e3f8b83ad5e?w=500" },  "https://images.unsplash.com/photo-1645709448380-6e4002beb900?w=640&h=360&fit=crop", // White car at gas pump

  return vehicle ? JSON.parse(JSON.stringify(vehicle)) : null;

}  { id: "mock-veh-028", name: "Seagull D1", brand: "Seagull", model: "D1", price: "340000000", status: "available", image: "https://images.unsplash.com/photo-1577818946779-4e5de60bd017?w=500" },  "https://images.unsplash.com/photo-1645709364557-0fefce7413e8?w=640&h=360&fit=crop", // White car parked (EV)


  { id: "mock-veh-029", name: "Geometry C", brand: "Geometry", model: "C", price: "420000000", status: "available", image: "https://images.unsplash.com/photo-1590362891990-f8ddb41d54e0?w=500" },  "https://images.unsplash.com/photo-1672542128826-5f0d578713d2?w=640&h=360&fit=crop", // Green EV charging sign

  { id: "mock-veh-030", name: "Aion S", brand: "Aion", model: "S", price: "480000000", status: "available", image: "https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=500" },  "https://images.unsplash.com/photo-1698653223780-2d1894543c43?w=640&h=360&fit=crop", // Door handle close-up

  { id: "mock-veh-031", name: "ZS EV", brand: "ZS", model: "EV", price: "400000000", status: "available", image: "https://images.unsplash.com/photo-1560958089-b8a63eead8cb?w=500" },  "https://images.unsplash.com/photo-1698653223257-973748a5c522?w=640&h=360&fit=crop", // Hood close-up

  { id: "mock-veh-032", name: "Icon iX", brand: "Icon", model: "iX", price: "650000000", status: "available", image: "https://images.unsplash.com/photo-1617469762185-7e4ee4da7eaf?w=500" },  "https://images.unsplash.com/photo-1698653223144-549c62be9e4a?w=640&h=360&fit=crop", // Dashboard with steering wheel

  { id: "mock-veh-033", name: "Jidu ROBO-01", brand: "Jidu", model: "ROBO-01", price: "700000000", status: "available", image: "https://images.unsplash.com/photo-1553882900-f2b06423b350?w=500" },  "https://images.unsplash.com/photo-1698653223508-04d1ee813094?w=640&h=360&fit=crop", // Tire close-up

  { id: "mock-veh-034", name: "Luxeed S7", brand: "Luxeed", model: "S7", price: "800000000", status: "available", image: "https://images.unsplash.com/photo-1549399542-7e3f8b83ad5e?w=500" },  "/images/vehicle-placeholder.svg", // Fallback placeholder

  { id: "mock-veh-035", name: "Nio ET5", brand: "Nio", model: "ET5", price: "950000000", status: "available", image: "https://images.unsplash.com/photo-1577818946779-4e5de60bd017?w=500" },];

  { id: "mock-veh-036", name: "Os Atto 3", brand: "Os", model: "Atto 3", price: "620000000", status: "available", image: "https://images.unsplash.com/photo-1590362891990-f8ddb41d54e0?w=500" },

  { id: "mock-veh-037", name: "Pilot EV2", brand: "Pilot", model: "EV2", price: "540000000", status: "available", image: "https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=500" },function randomChoice(arr, seedIndex) {

  { id: "mock-veh-038", name: "Qv Gold Star", brand: "Qv", model: "Gold Star", price: "480000000", status: "available", image: "https://images.unsplash.com/photo-1560958089-b8a63eead8cb?w=500" },  return arr[seedIndex % arr.length];

  { id: "mock-veh-039", name: "Roewe Ri6", brand: "Roewe", model: "Ri6", price: "520000000", status: "available", image: "https://images.unsplash.com/photo-1617469762185-7e4ee4da7eaf?w=500" },}

  { id: "mock-veh-040", name: "Sung EV1", brand: "Sung", model: "EV1", price: "450000000", status: "available", image: "https://images.unsplash.com/photo-1553882900-f2b06423b350?w=500" },

  { id: "mock-veh-041", name: "Tai EV", brand: "Tai", model: "EV", price: "420000000", status: "available", image: "https://images.unsplash.com/photo-1549399542-7e3f8b83ad5e?w=500" },function imgFor(index) {

  { id: "mock-veh-042", name: "Uno Mille", brand: "Uno", model: "Mille", price: "380000000", status: "available", image: "https://images.unsplash.com/photo-1577818946779-4e5de60bd017?w=500" },  // Cycle through real EV images, fallback to placeholder

  { id: "mock-veh-043", name: "Venucia D60 EV", brand: "Venucia", model: "D60 EV", price: "500000000", status: "available", image: "https://images.unsplash.com/photo-1590362891990-f8ddb41d54e0?w=500" },  return REAL_EV_IMAGES[index % REAL_EV_IMAGES.length];

  { id: "mock-veh-044", name: "Wan N01", brand: "Wan", model: "N01", price: "460000000", status: "available", image: "https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=500" },}

  { id: "mock-veh-045", name: "Xev Yoyo", brand: "Xev", model: "Yoyo", price: "400000000", status: "available", image: "https://images.unsplash.com/photo-1560958089-b8a63eead8cb?w=500" },

  { id: "mock-veh-046", name: "Zotye Dajin EV", brand: "Zotye", model: "Dajin EV", price: "420000000", status: "available", image: "https://images.unsplash.com/photo-1617469762185-7e4ee4da7eaf?w=500" },function buildMockVehicles(count = 50) {

  { id: "mock-veh-047", name: "XPeng G3", brand: "XPeng", model: "G3", price: "680000000", status: "available", image: "https://images.unsplash.com/photo-1553882900-f2b06423b350?w=500" },  const items = [];

  { id: "mock-veh-048", name: "Wuling Hongguang MINI", brand: "Wuling", model: "Hongguang MINI", price: "350000000", status: "available", image: "https://images.unsplash.com/photo-1549399542-7e3f8b83ad5e?w=500" },  let versionCounter = 1;

  { id: "mock-veh-049", name: "Chery QQ Ice-Cream", brand: "Chery", model: "QQ Ice-Cream", price: "360000000", status: "available", image: "https://images.unsplash.com/photo-1577818946779-4e5de60bd017?w=500" },  for (let i = 0; i < count; i++) {

  { id: "mock-veh-050", name: "Li Auto ONE", brand: "Li Auto", model: "ONE", price: "1100000000", status: "available", image: "https://images.unsplash.com/photo-1590362891990-f8ddb41d54e0?w=500" },    const brandBlock = BRANDS[i % BRANDS.length];

];    const brand = brandBlock.brand;

    const model = brandBlock.models[i % brandBlock.models.length];

export function getMockVehicles() {    const versionName = ["Base", "Plus", "Premium", "Ultra"][i % 4];

  return JSON.parse(JSON.stringify(mockVehicles));    const color = randomChoice(COLORS, i);

}    const evType = randomChoice(TYPES, i + 3);

    const horsePower = 110 + ((i * 15) % 290); // 110 - 400 HP

export function findMockVehicleById(id) {    const basePrice = 450_000_000 + ((i * 37) % 120) * 10_000_000; // ~450M - ~1.6B VND

  const vehicle = mockVehicles.find((v) => v.id === id);    const stockQuantity = (i * 7) % 23; // 0 - 22

  return vehicle ? JSON.parse(JSON.stringify(vehicle)) : null;

}    const vehicleId = `mock-veh-${(i % 20) + 1}`; // model-level id

    const vehicleVersionId = `mock-${versionCounter++}`;

    items.push({
      vehicleVersionId,
      vehicleId,
      brand,
      modelName: model,
      versionName,
      basePrice,
      color,
      evType,
      horsePower,
      stockQuantity,
      imageUrl: imgFor(i),
    });
  }
  return items;
}

export const vehiclesMock = buildMockVehicles(50);

export function findMockByVersionId(id) {
  return vehiclesMock.find((v) => v.vehicleVersionId === id);
}

export function filterMocksByFilters(filters = {}) {
  const { searchValue, selectedModel, priceMin, priceMax, selectedColors } = filters;
  let list = [...vehiclesMock];

  if (searchValue) {
    const q = searchValue.toLowerCase();
    list = list.filter(
      (x) =>
        x.brand.toLowerCase().includes(q) ||
        x.modelName.toLowerCase().includes(q) ||
        x.versionName.toLowerCase().includes(q)
    );
  }

  if (selectedModel && selectedModel !== "Tất cả") {
    list = list.filter((x) => String(x.vehicleId) === String(selectedModel));
  }

  const min = priceMin ? Number(priceMin) : null;
  const max = priceMax ? Number(priceMax) : null;
  if (min != null) list = list.filter((x) => x.basePrice >= min);
  if (max != null) list = list.filter((x) => x.basePrice <= max);

  if (Array.isArray(selectedColors) && selectedColors.length > 0) {
    const set = new Set(selectedColors.map(String));
    list = list.filter((x) => set.has(String(x.color)));
  }

  return list;
}

export function uniqueMockModels() {
  // Return unique { vehicleId, brand, modelName }
  const map = new Map();
  for (const v of vehiclesMock) {
    if (!map.has(v.vehicleId)) {
      map.set(v.vehicleId, { vehicleId: v.vehicleId, brand: v.brand, modelName: v.modelName });
    }
  }
  return Array.from(map.values());
}

export default vehiclesMock;
