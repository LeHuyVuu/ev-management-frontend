import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const TARGETS_API = "https://prn232.freeddns.org/dealer-service/api/DealerTargets?pageNumber=1&pageSize=10";
const DEALERS_API = "https://prn232.freeddns.org/dealer-service/api/Dealers?pageNumber=1&pageSize=100";

const SalesTargets = () => {
  const [targets, setTargets] = useState([]);
  const [loadingTargets, setLoadingTargets] = useState(true);
  const [dealers, setDealers] = useState([]);
  const [form, setForm] = useState({
    dealerId: "",
    period: "Monthly",
    targetAmount: "",
    startDate: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch dealer list for dropdown
  useEffect(() => {
    const fetchDealers = async () => {
      try {
        const res = await fetch(DEALERS_API);
        const json = await res.json();
        if (res.ok && json.status === 200 && json.data?.items) {
          setDealers(json.data.items);
        } else {
          console.warn("Dealers API returned error or unexpected format", json);
        }
      } catch (err) {
        console.error("Failed to fetch dealers:", err);
      }
    };
    fetchDealers();
  }, []);

  // Fetch all targets from new endpoint
  useEffect(() => {
    const fetchTargets = async () => {
      try {
        setLoadingTargets(true);
        const res = await fetch(TARGETS_API);
        const json = await res.json();
        if (res.ok && json.status === 200 && json.data?.items) {
          setTargets(json.data.items);
        } else {
          console.warn("Targets API error or unexpected format", json);
          setTargets([]);
        }
      } catch (err) {
        console.error("Error fetching sales targets:", err);
        setTargets([]);
      } finally {
        setLoadingTargets(false);
      }
    };
    fetchTargets();
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // validate fields
    if (!form.dealerId || !form.period || !form.targetAmount || !form.startDate) {
      alert("Vui lòng điền đầy đủ các trường.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`https://prn232.freeddns.org/dealer-service/api/Dealers/${form.dealerId}/targets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/plain",
        },
        body: JSON.stringify({
          period: form.period,
          targetAmount: parseInt(form.targetAmount, 10),
          startDate: form.startDate,
        }),
      });
      if (res.ok) {
        alert("Target created successfully.");
        // Sau khi tạo, có thể refresh list target bằng fetchTargets lại hoặc thêm target mới vào state
        // Gọi lại fetchTargets: (phụ thuộc vào backend)
        const updatedListRes = await fetch(TARGETS_API);
        const updatedJson = await updatedListRes.json();
        if (updatedListRes.ok && updatedJson.status === 200 && updatedJson.data?.items) {
          setTargets(updatedJson.data.items);
        }
        // reset form
        setForm({ dealerId: "", period: "Monthly", targetAmount: "", startDate: "" });
      } else {
        console.error("Failed to create target", await res.text());
        alert("Failed to create target");
      }
    } catch (err) {
      console.error("Error creating target:", err);
      alert("Có lỗi khi tạo target");
    } finally {
      setSubmitting(false);
    }
  };

  const Skeleton = () => (
    <div className="space-y-2 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="w-full bg-indigo-100 rounded-full h-2">
        <div className="bg-indigo-300 h-2 rounded-full w-1/4" />
      </div>
      <div className="h-4 bg-gray-200 rounded w-10 text-right" />
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Sales Target Management
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Form tạo mới Target */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Set New Target</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dealer</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                value={form.dealerId}
                onChange={(e) => handleChange("dealerId", e.target.value)}
                disabled={submitting}
              >
                <option value="">Select a dealer</option>
                {dealers.map((dealer) => (
                  <option key={dealer.dealerId} value={dealer.dealerId}>
                    {dealer.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font medium text-gray-700 mb-1">Period</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                value={form.period}
                onChange={(e) => handleChange("period", e.target.value)}
                disabled={submitting}
              >
                <option>Monthly</option>
                <option>Quarterly</option>
                <option>Yearly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., 150000"
                value={form.targetAmount}
                onChange={(e) => handleChange("targetAmount", e.target.value)}
                disabled={submitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                value={form.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
                disabled={submitting}
              />
            </div>
            <div>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? "Saving..." : "Set Target"}
              </button>
            </div>
          </div>
        </div>

        {/* Hiển thị các target từ API mới */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Targets & Progress</h3>
          <div className="space-y-6">
            {loadingTargets && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} />)}

            {!loadingTargets && targets.map((t, i) => {
              // nếu backend trả dealerName trong t, dùng t.dealerName; nếu không, hiện dealerId
              const dealerLabel = t.dealerName || t.dealerId;
              const percent = t.targetAmount
                ? Math.round((t.achievedAmount / t.targetAmount) * 100)
                : 0;
              return (
                <div key={t.dealerTargetId}>
                  <div className="flex justify-between items-center mb-1">
                    <div>
                      <p className="font-medium text-gray-900">{dealerLabel}</p>
                      <p className="text-sm text-gray-600">
                        Target: <span className="font-semibold">${t.targetAmount.toLocaleString()}</span>
                        {" | "}
                        Achieved: <span className="font-semibold">${t.achievedAmount.toLocaleString()}</span>
                      </p>
                    </div>
                    <span className="text-sm text-gray-500">{t.period}</span>
                  </div>
                  <div className="w-full bg-indigo-100 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                  <p className="text-right text-sm font-medium text-gray-700 mt-1">
                    {percent}%
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesTargets;
