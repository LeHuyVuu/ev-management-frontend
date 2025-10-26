import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Layout, Menu, Typography } from "antd";
import {
  DashboardOutlined,
  CarOutlined,
  FileTextOutlined,
  SafetyCertificateOutlined,
  CalendarOutlined,
  UserOutlined,
  DeploymentUnitOutlined,
  AuditOutlined,
  BarChartOutlined,
  FolderOpenOutlined,
  TruckOutlined,
} from "@ant-design/icons";

const { Sider } = Layout;
const { Text } = Typography;

const Sidebar = () => {
  const { pathname } = useLocation();

  const items = [
   

    // Bán hàng & CRM
    {
      key: "group-sales",
      type: "group",
      label: <Text type="secondary" style={{ textTransform: "uppercase", fontSize: 12 }}>Bán hàng & CRM</Text>,
      children: [
        {
          key: "/dealer/vehicle-search",
          icon: <CarOutlined />,
          label: <Link to="/dealer/vehicle-search">Thông tin xe</Link>,
        },
        {
          key: "/dealer/quote-management",
          icon: <FileTextOutlined />,
          label: <Link to="/dealer/quote-management">Quản lý báo giá</Link>,
        },
        {
          key: "/dealer/contract",
          icon: <SafetyCertificateOutlined />,
          label: <Link to="/dealer/contract">Quản lý hợp đồng</Link>,
        },
        {
          key: "/dealer/driver-schedule",
          icon: <CalendarOutlined />,
          label: <Link to="/dealer/driver-schedule">Lịch lái thử</Link>,
        },
        {
          key: "/dealer/customer-crm",
          icon: <UserOutlined />,
          label: <Link to="/dealer/customer-crm">Quản lý khách hàng</Link>,
        },
      ],
    },

    // Hoạt động
    {
      key: "group-ops",
      type: "group",
      label: <Text type="secondary" style={{ textTransform: "uppercase", fontSize: 12 }}>Hoạt động</Text>,
      children: [
        {
          key: "/dealer/vehicle-allocation",
          icon: <TruckOutlined />,
          label: <Link to="/dealer/vehicle-allocation">Yêu cầu phân bổ xe</Link>,
        },
        {
          key: "/dealer/delivery-tracking",
          icon: <AuditOutlined />,
          label: <Link to="/dealer/delivery-tracking">Theo dõi giao hàng</Link>,
        },
      ],
    },

    // Báo cáo (1)
    {
      key: "group-report-1",
      type: "group",
      label: <Text type="secondary" style={{ textTransform: "uppercase", fontSize: 12 }}>Báo cáo</Text>,
      children: [
        {
          key: "/dealer/dashboard",
          icon: <BarChartOutlined />,
          label: <Link to="/dealer/dashboard">My Dashboard</Link>,
        },
      ],
    },

    // Báo cáo (2)
    {
      key: "group-report-2",
      type: "group",
      label: <Text type="secondary" style={{ textTransform: "uppercase", fontSize: 12 }}>Báo cáo</Text>,
      children: [
        {
          key: "/evm/reports-analytics",
          icon: <FolderOpenOutlined />,
          label: <Link to="/evm/reports-analytics">TRANG CỦA EVM ==></Link>,
        },
      ],
    },
  ];

  return (
    <Sider
      width={256}
      theme="light"
      style={{ height: "100vh", position: "sticky", top: 0, boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}
    >
    

      <Menu
        mode="inline"
        selectedKeys={[pathname]}
        defaultOpenKeys={[
          "group-sales",
          "group-ops",
          "group-report-1",
          "group-report-2",
        ]}
        items={items}
        style={{ borderRight: 0, padding: "8px 0" }}
      />
    </Sider>
  );
};

export default Sidebar;
