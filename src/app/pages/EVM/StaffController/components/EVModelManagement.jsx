import React, { useState } from "react";
import AddModelModal from "./AddModelModal";

const EVModelManagement = () => {
  const [models, setModels] = useState([
    { name: "EVM Model X", version: "Standard", color: "Pearl White", stock: 120 },
    { name: "EVM Model X", version: "Extended Range", color: "Sapphire Black", stock: 85 },
    { name: "EVM Model Y", version: "Performance", color: "Crimson Red", stock: 150 },
    { name: "EVM Model Z", version: "Premium", color: "Titanium Gray", stock: 90 },
    { name: "EVM Model Y", version: "Standard", color: "Sky Blue Metallic", stock: 110 },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddModel = (newModel) => {
    setModels([...models, newModel]);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">EV Model Management</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center space-x-2"
        >
          <span>＋</span>
          <span>Add New Model</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Model Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Version</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Color</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Stock</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {models.map((m, i) => (
              <tr key={i}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{m.name}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{m.version}</td>
                <td className="px-6 py-4 text-sm">
                  <span className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                    {m.color}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{m.stock}</td>
                <td className="px-6 py-4 text-sm flex space-x-3">
                  <button
                    className="text-gray-500 hover:text-indigo-600"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    className="text-gray-500 hover:text-red-600"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal thêm mới model */}
      <AddModelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddModel}
      />
    </div>
  );
};

export default EVModelManagement;
