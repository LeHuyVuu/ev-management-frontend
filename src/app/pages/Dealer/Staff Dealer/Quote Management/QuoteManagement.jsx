import React, { useState } from "react";
import QuoteForm from "./components/QuoteForm";
import QuoteSummary from "./components/QuoteSummary";
import RecentQuotes from "./components/RecentQuotes";

function QuoteManagement() {
  const [activeTab, setActiveTab] = useState("create"); // ✅ Sửa tại đây

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-6">Quản lý báo giá</h1>

      {/* Tabs */}
      <div className="border-b mb-4">
        <nav className="flex gap-4" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("create")}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-[1px] transition
              ${activeTab === "create"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"}`}
          >
            Tạo báo giá
          </button>
          <button
            onClick={() => setActiveTab("recent")}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-[1px] transition
              ${activeTab === "recent"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"}`}
          >
            Báo giá gần đây
          </button>
        </nav>
      </div>

      {activeTab === "create" && (
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-1/2">
            <QuoteForm />
          </div>
          <div className="w-full lg:w-1/2">
            <QuoteSummary />
          </div>
        </div>
      )}

      {activeTab === "recent" && (
        <div className="flex justify-center lg:justify-start">
          <RecentQuotes />
        </div>
      )}
    </div>
  );
}

export default QuoteManagement;
