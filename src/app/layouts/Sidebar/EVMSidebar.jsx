import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Layout, Menu, Typography } from "antd";
import {
  AppstoreOutlined,
  TagsOutlined,
  CarOutlined,
  TeamOutlined,
  BarChartOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Backpack } from "lucide-react";

const { Sider } = Layout;
const { Text } = Typography;

const Sidebar = () => {
  const location = useLocation();

  const items = [
    {
      key: "/evm/staff-controller",
      icon: <AppstoreOutlined />,
      label: <Link to="/evm/staff-controller">Dashboard</Link>,
    },
    {
      key: "/evm/product-distribution",
      icon: <TagsOutlined />,
      label: (
        <Link to="/evm/product-distribution">
          Manage Sale, Promotion &amp; Discount
        </Link>
      ),
    },
    {
      key: "/evm/vehicle-allocation-transfer",
      icon: <CarOutlined />,
      label: (
        <Link to="/evm/vehicle-allocation-transfer">
          Vehicle Allocation &amp; Transfer
        </Link>
      ),
    },
    {
      key: "/evm/dealer-management",
      icon: <TeamOutlined />,
      label: <Link to="/evm/dealer-management">Dealer Management</Link>,
    },
    {
      key: "/evm/reports-analytics",
      icon: <BarChartOutlined />,
      label: <Link to="/evm/reports-analytics">Reports &amp; Analytics</Link>,
    },
    {
      key: "/evm/system-administration",
      icon: <SettingOutlined />,
      label: <Link to="/evm/system-administration">System Administration</Link>,
    },
     {
      key: "/dealer/contract",
      icon: <Backpack />,
      label: <Link to="/dealer/contract">Quay về trang dealer</Link>,
    },
  ];

  return (
    <Sider
      width={256}
      theme="light"
      style={{
        height: "100vh",
        position: "sticky",
        top: 0,
        borderRight: "1px solid #f0f0f0",
        boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
      }}
    >
      {/* Header */}
      <div style={{ padding: "16px 16px 8px", borderBottom: "1px solid #f0f0f0" }}>
        <Text type="secondary" strong style={{ letterSpacing: 1, fontSize: 12 }}>
          MANAGEMENT
        </Text>
      </div>

      {/* Menu */}
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={items}
        style={{ padding: "8px 0" }}
      />
    </Sider>
  );
};

export default Sidebar;
