import React, { useState } from "react";

const CreateDealerModal = ({ onClose, onCreate }) => {
  const [newDealer, setNewDealer] = useState({
    dealerCode: "",
    name: "",
    region: "",
    address: "",
    contactEmail: "",
    contactPhone: "",
    status: "Active",
  });

  const handleChange = (field, value) => {
    setNewDealer((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (
      !newDealer.dealerCode ||
      !newDealer.name ||
      !newDealer.contactEmail ||
      !newDealer.contactPhone
    ) {
      alert("⚠️ Vui lòng nhập đầy đủ Dealer Code, Name, Email và Phone");
      return;
    }
    onCreate(newDealer);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Create Dealer Account</h3>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Dealer Code
            </label>
            <input
              type="text"
              value={newDealer.dealerCode}
              onChange={(e) => handleChange("dealerCode", e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-md p-2"
              placeholder="VD: DLR007"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Dealer Name
            </label>
            <input
              type="text"
              value={newDealer.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-md p-2"
              placeholder="VD: EVM Motors Hue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Region
            </label>
            <input
              type="text"
              value={newDealer.region}
              onChange={(e) => handleChange("region", e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-md p-2"
              placeholder="North / Central / South..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              type="text"
              value={newDealer.address}
              onChange={(e) => handleChange("address", e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-md p-2"
              placeholder="VD: 123 Nguyen Trai, HN"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Contact Email
            </label>
            <input
              type="email"
              value={newDealer.contactEmail}
              onChange={(e) => handleChange("contactEmail", e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-md p-2"
              placeholder="dealer@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Contact Phone
            </label>
            <input
              type="text"
              value={newDealer.contactPhone}
              onChange={(e) => handleChange("contactPhone", e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-md p-2"
              placeholder="090xxxxxxx"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              value={newDealer.status}
              onChange={(e) => handleChange("status", e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-md p-2"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end mt-6 space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateDealerModal;
