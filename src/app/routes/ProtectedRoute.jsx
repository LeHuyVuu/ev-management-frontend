import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;

  try {
    const decoded = jwtDecode(token);
    const roleId = parseInt(decoded.RoleId); // ✅ ép kiểu string -> number

    if (allowedRoles.includes(roleId)) {
      return <Outlet />;
    } else {
      console.warn("RoleId not allowed:", roleId, "Allowed:", allowedRoles);
      return <div className="p-6">You do not have permission to access this page.</div>;
    }
  } catch (err) {
    console.error("JWT decode error:", err);
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
