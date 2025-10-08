import React from "react";

const UpdateDealerModal = ({ dealer, onClose, onSave, setDealer }) => {
  if (!dealer) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Update Dealer</h3>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Dealer Name
            </label>
            <input
              type="text"
              value={dealer.name}
              onChange={(e) =>
                setDealer({
                  ...dealer,
                  name: e.target.value,
                })
              }
              className="mt-1 w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Region
            </label>
            <input
              type="text"
              value={dealer.region}
              onChange={(e) =>
                setDealer({
                  ...dealer,
                  region: e.target.value,
                })
              }
              className="mt-1 w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Contact Email
            </label>
            <input
              type="email"
              value={dealer.contactEmail}
              onChange={(e) =>
                setDealer({
                  ...dealer,
                  contactEmail: e.target.value,
                })
              }
              className="mt-1 w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Contact Phone
            </label>
            <input
              type="text"
              value={dealer.contactPhone}
              onChange={(e) =>
                setDealer({
                  ...dealer,
                  contactPhone: e.target.value,
                })
              }
              className="mt-1 w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              value={dealer.status}
              onChange={(e) =>
                setDealer({
                  ...dealer,
                  status: e.target.value,
                })
              }
              className="mt-1 w-full border border-gray-300 rounded-md p-2"
            >
              <option value="active">Active</option>
              <option value="terminated">Terminated</option>
              <option value="expired">expired</option>

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
            onClick={onSave}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateDealerModal;
