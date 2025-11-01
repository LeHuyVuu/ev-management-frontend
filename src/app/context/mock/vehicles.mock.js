export const mockVehicles = [
  { id: "mock-veh-001", name: "Tesla Model 3", brand: "Tesla", model: "Model 3", price: "800000000", status: "available", image: "https://images.unsplash.com/photo-1560958089-b8a63eead8cb?w=500" },
  { id: "mock-veh-002", name: "Tesla Model Y", brand: "Tesla", model: "Model Y", price: "950000000", status: "available", image: "https://images.unsplash.com/photo-1617469762185-7e4ee4da7eaf?w=500" },
  { id: "mock-veh-003", name: "BMW i3", brand: "BMW", model: "i3", price: "600000000", status: "available", image: "https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=500" },
  { id: "mock-veh-004", name: "BMW i4", brand: "BMW", model: "i4", price: "750000000", status: "available", image: "https://images.unsplash.com/photo-1617469762185-7e4ee4da7eaf?w=500" },
  { id: "mock-veh-005", name: "Audi e-tron", brand: "Audi", model: "e-tron", price: "850000000", status: "available", image: "https://images.unsplash.com/photo-1553882900-f2b06423b350?w=500" },
];

export function getMockVehicles() {
  return JSON.parse(JSON.stringify(mockVehicles));
}

export function findMockVehicleById(id) {
  const vehicle = mockVehicles.find(v => v.id === id);
  return vehicle ? JSON.parse(JSON.stringify(vehicle)) : null;
}
