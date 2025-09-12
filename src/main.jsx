import { createRoot } from "react-dom/client";
import "./index.css";
import MainRoutes from "./app/routes/MainRoutes.jsx";
import "primereact/resources/themes/lara-light-blue/theme.css"; // Chủ đề sáng
import "primereact/resources/primereact.min.css"; /* Core CSS */
import "primeicons/primeicons.css"; /* Bộ Icon */
import { GoogleOAuthProvider } from "@react-oauth/google"; // Đảm bảo import GoogleOAuthProvider từ thư viện đúng

createRoot(document.getElementById("root")).render(
    <GoogleOAuthProvider clientId="257452836877-l7ghjn62nmjeclg33uj2q39g8fqr96v0.apps.googleusercontent.com">
      <MainRoutes />
    </GoogleOAuthProvider>
);