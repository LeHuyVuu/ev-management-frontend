// src/routes/ProtectedRoute.jsx
import { Navigate, Outlet, Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { Result, Button, Typography } from "antd";
import { ArrowLeftOutlined, LoginOutlined, LockOutlined, HomeOutlined } from "@ant-design/icons";

const { Paragraph } = Typography;

// Mapping role -> default home route
const HOME_BY_ROLE = {
  1: "/evm/product-distribution",
  2: "/evm/product-distribution",
  3: "/dealer/dashboard",
  4: "/dealer/dashboard",
};

const getHomePath = (roleId) => HOME_BY_ROLE[roleId] || "/login";

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;

  try {
    const decoded = jwtDecode(token);
    const roleId = parseInt(decoded.RoleId, 10); // giữ nguyên ép kiểu

    if (allowedRoles.includes(roleId)) {
      // ✅ Không ảnh hưởng layout hiện tại
      return <Outlet />;
    }

    console.warn("RoleId not allowed:", roleId, "Allowed:", allowedRoles);
    const homePath = getHomePath(roleId);

    return (
      <div style={{ padding: 24 }}>
        <Result
          status="403"
          title="403 - Forbidden"
          subTitle={
            <Paragraph style={{ marginTop: 8 }}>
              <LockOutlined style={{ marginRight: 8 }} />
              Bạn không có quyền truy cập trang này. Vui lòng liên hệ quản trị viên nếu bạn nghĩ đây là nhầm lẫn.
            </Paragraph>
          }
          extra={
            <>
             
              <Link to="/login">
                <Button icon={<LoginOutlined />}>
                  Đăng nhập tài khoản khác
                </Button>
              </Link>
              <Button icon={<ArrowLeftOutlined />} onClick={() => window.history.back()} style={{ marginLeft: 8 }}>
                Quay lại
              </Button>
            </>
          }
        />
      </div>
    );
  } catch (err) {
    console.error("JWT decode error:", err);
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
