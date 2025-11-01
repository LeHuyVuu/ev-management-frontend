import React, { useEffect, useState } from "react";
import api from "../../../../../context/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Package, Clock } from "lucide-react";
import { Button, Skeleton, Tag, Divider } from "antd";
import ContractModalAnt from "./ContractCardAnt";

export default function CustomerProfile({ customer }) {
  const [activeTab, setActiveTab] = useState("profile");
  const [contracts, setContracts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const [openContract, setOpenContract] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);

  // ✅ loading states
  const [loadingContracts, setLoadingContracts] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true); // <-- NEW

  useEffect(() => {
    let profileTimer;
    if (customer?.customerId) {
      // Hiển thị skeleton form ngắn để tránh nhấp nháy khi đổi khách hàng
      setLoadingProfile(true);
      setForm(customer);
      profileTimer = setTimeout(() => setLoadingProfile(false), 300);

      // 🔹 Lấy hợp đồng
      setLoadingContracts(true);
      fetch(`${api.customer}/customers/${customer.customerId}/contracts`)
        .then((res) => res.json())
        .then((res) => {
          if (res.status === 200) setContracts(res.data || []);
          else setContracts([]);
        })
        .catch((err) => {
          console.error("Error loading contracts:", err);
          setContracts([]);
        })
        .finally(() => setLoadingContracts(false));

      // 🔹 Lấy đơn hàng
      setLoadingOrders(true);
      fetch(
        `https://prn232.freeddns.org/customer-service/customers/${customer.customerId}/orders`,
        { headers: { Accept: "*/*" } }
      )
        .then((res) => res.json())
        .then((res) => {
          if (res.status === 200) setOrders(res.data || []);
          else setOrders([]);
        })
        .catch((err) => {
          console.error("Error loading orders:", err);
          setOrders([]);
        })
        .finally(() => setLoadingOrders(false));
    } else {
      setForm({});
      setContracts([]);
      setOrders([]);
      setLoadingProfile(false);
    }

    return () => {
      if (profileTimer) clearTimeout(profileTimer);
    };
  }, [customer]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async () => {
    if (!form.customerId) return;
    try {
      setSaving(true);
      const res = await fetch(`${api.customer}/api/customers`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
        },
        body: JSON.stringify({
          customerId: form.customerId,
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
          status: form.status,
        }),
      });
      if (res.ok) {
        toast.success("Cập nhật khách hàng thành công");
      } else {
        toast.error("Cập nhật thất bại");
      }
    } catch (err) {
      console.error("Update failed", err);
      toast.error("Có lỗi xảy ra khi cập nhật");
    } finally {
      setSaving(false);
    }
  };

  if (!customer) return <div>Chọn khách hàng để xem thông tin</div>;

  const openContractDetail = (c) => {
    setSelectedContract({
      id: c.contractId,
      customer: c.customerName,
      car: [c.brand, c.vehicleName, c.versionName].filter(Boolean).join(" "),
      content: c.content,
    });
    setOpenContract(true);
  };

  const fmtCurrency = (n) =>
    typeof n === "number"
      ? n.toLocaleString("vi-VN", { style: "currency", currency: "VND" })
      : n;

  const StatusTag = ({ status }) => (
    <Tag
      color={
        (status || "").toLowerCase() === "draft"
          ? "default"
          : (status || "").toLowerCase() === "signed"
          ? "green"
          : "blue"
      }
      style={{ textTransform: "capitalize" }}
    >
      {status}
    </Tag>
  );

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white w-full max-w-6xl">
      <ToastContainer position="top-right" autoClose={3000} />

      <h1 className="text-xl font-semibold mb-4">
        {customer?.name || "Không rõ tên"}
      </h1>

      {/* Tabs */}
      <div className="bg-gray-100 rounded-lg p-2 mb-6">
        <div className="inline-flex rounded-md overflow-hidden">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeTab === "profile"
                ? "bg-white shadow-sm text-gray-800"
                : "text-gray-500"
            }`}
          >
            Hồ sơ
          </button>
          <button
            onClick={() => setActiveTab("contracts")}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeTab === "contracts"
                ? "bg-white shadow-sm text-gray-800"
                : "text-gray-500"
            }`}
          >
            Hợp đồng khách hàng
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeTab === "orders"
                ? "bg-white shadow-sm text-gray-800"
                : "text-gray-500"
            }`}
          >
            Đơn hàng khách hàng
          </button>
        </div>
      </div>

      {/* Tab Hồ sơ */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loadingProfile ? (
            <>
              <div>
                <label className="text-sm text-gray-600">Tên Khách hàng</label>
                <div className="mt-2">
                  <Skeleton.Input active block style={{ height: 38 }} />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600">Điện thoại</label>
                <div className="mt-2">
                  <Skeleton.Input active block style={{ height: 38 }} />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600">Email</label>
                <div className="mt-2">
                  <Skeleton.Input active block style={{ height: 38 }} />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600">Địa chỉ</label>
                <div className="mt-2">
                  <Skeleton.Input active block style={{ height: 38 }} />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600">Trạng thái</label>
                <div className="mt-2">
                  <Skeleton.Input active block style={{ height: 38 }} />
                </div>
              </div>
              <div className="md:col-span-2">
                <Skeleton.Button active block style={{ height: 40 }} />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-sm text-gray-600">Tên Khách hàng</label>
                <input
                  type="text"
                  value={form?.name || ""}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="mt-2 block w-full border border-gray-200 rounded-md px-3 py-2 bg-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Điện thoại</label>
                <input
                  type="text"
                  value={form?.phone || ""}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="mt-2 block w-full border border-gray-200 rounded-md px-3 py-2 bg-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Email</label>
                <input
                  type="text"
                  value={form?.email || ""}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="mt-2 block w-full border border-gray-200 rounded-md px-3 py-2 bg-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Địa chỉ</label>
                <input
                  type="text"
                  value={form?.address || ""}
                  onChange={(e) => handleChange("address", e.target.value)}
                  className="mt-2 block w-full border border-gray-200 rounded-md px-3 py-2 bg-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Trạng thái</label>
                <input
                  type="text"
                  value={form?.status || ""}
                  onChange={(e) => handleChange("status", e.target.value)}
                  className="mt-2 block w-full border border-gray-200 rounded-md px-3 py-2 bg-white text-gray-700"
                />
              </div>
              <div className="md:col-span-2">
                <Button type="primary" loading={saving} onClick={handleUpdate}>
                  Lưu thay đổi
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Tab Hợp đồng */}
      {activeTab === "contracts" && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Hợp đồng khách hàng</h2>
          {loadingContracts ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} active paragraph={{ rows: 3 }} />
              ))}
            </div>
          ) : contracts.length === 0 ? (
            <p className="text-sm text-gray-500">Không có hợp đồng nào</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contracts.map((c) => (
                <div
                  key={c.contractId}
                  className="border rounded-lg p-4 shadow-sm hover:shadow-md transition bg-white"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-gray-800">
                      Mã hợp đồng
                      <div className="text-xs text-gray-500 break-all">{c.contractId}</div>
                    </h3>
                    <StatusTag status={c.status} />
                  </div>

                  <Divider className="my-3" />

                  <div className="text-sm space-y-1">
                    <div>
                      <span className="text-gray-500">Nhân viên phụ trách: </span>
                      <span className="font-medium">{c.staffContract || "-"}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Hãng xe: </span>
                      <span className="font-medium">{c.brand || "-"}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Dòng xe: </span>
                      <span className="font-medium">{c.vehicleName || "-"}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Phiên bản: </span>
                      <span className="font-medium">{c.versionName || "-"}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Giá trị HĐ: </span>
                      <span className="font-semibold">{fmtCurrency(c.totalValue)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Ngày ký: </span>
                      <span className="font-medium">{c.signedDate || "-"}</span>
                    </div>
                  </div>

                  {/* Tạo/Cập nhật nếu API có */}
                  {(c.createdAt || c.updatedAt) && (
                    <div className="mt-3 text-xs text-gray-500">
                      {c.createdAt && (
                        <div>
                          Tạo: {new Date(c.createdAt).toLocaleDateString()}
                        </div>
                      )}
                      {c.updatedAt && (
                        <div>
                          Cập nhật: {new Date(c.updatedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-3">
                    <Button
                      type="link"
                      onClick={(e) => {
                        e.stopPropagation();
                        openContractDetail(c);
                      }}
                    >
                      Xem chi tiết
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Đơn hàng */}
      {activeTab === "orders" && (
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Package className="text-blue-600" size={18} />
            Danh sách đơn hàng
          </h2>
          {loadingOrders ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} active paragraph={{ rows: 2 }} />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <p className="text-sm text-gray-500 italic">
              Khách hàng chưa có đơn hàng nào.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {orders.map((o) => (
                <div
                  key={o.orderId}
                  className="border rounded-lg p-4 shadow-sm hover:shadow-md transition bg-gray-50"
                >
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-gray-800 text-sm">
                      Mã đơn: {o.orderId.slice(0, 8)}...
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        o.status === "preparing"
                          ? "bg-yellow-200 text-yellow-800"
                          : "bg-green-200 text-green-800"
                      }`}
                    >
                      {o.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-600">
                    <Clock size={12} />
                    Ngày giao: {o.deliveryDate}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ✅ Modal chi tiết hợp đồng */}
      <ContractModalAnt
        open={openContract}
        contract={selectedContract}
        onClose={() => setOpenContract(false)}
      />
    </div>
  );
}
