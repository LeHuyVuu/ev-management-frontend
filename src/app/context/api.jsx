import axios from "axios";

// Tạo instance Axios với cấu hình mặc định
const api = axios.create({
  baseURL: "https://your-api-base-url.com", // thay URL gốc của API vào đây
  timeout: 10000, // Thời gian timeout mặc định (ms)
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Hàm gọi API tùy biến
 * @param {string} method - Phương thức HTTP (GET, POST, PUT, DELETE)
 * @param {string} url - Endpoint API
 * @param {object} [data] - Dữ liệu body (áp dụng cho POST, PUT, DELETE nếu cần)
 * @param {object} [params] - Query params (áp dụng cho GET hoặc khi cần)
 * @returns {Promise<any>} - Trả về dữ liệu từ response
 */
const callApi = async (method, url, data, params) => {
  try {
    const response = await api({
      method,
      url,
      data,
      params,
    });
    return response.data; // chỉ lấy data thay vì toàn response
  } catch (error) {
    console.error("API error:", error.response || error.message);
    throw error;
  }
};

// Các hàm tiện dụng
export const getData = (url, params) => callApi("get", url, null, params);
export const postData = (url, data) => callApi("post", url, data);
export const putData = (url, data) => callApi("put", url, data);
export const deleteData = (url, data) => callApi("delete", url, data);

export default api;
