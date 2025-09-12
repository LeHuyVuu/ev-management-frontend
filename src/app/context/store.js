import { signify } from 'react-signify';

export const sCountItem = signify(JSON.parse(localStorage.getItem("cartItems"))?.length || 0);
export const sProductsToBuy = signify([
    {
        id: null, // ID sản phẩm
        name: "", // Tên sản phẩm
        original_price: 0, // Giá gốc của sản phẩm
        price: 0, // Giá bán hiện tại của sản phẩm
        quantity: 1, // Số lượng sản phẩm
        thumbnail_url: "", // Đường dẫn hình ảnh thumbnail của sản phẩm
        totalPrice: 0, // Tổng giá sản phẩm (price * quantity)
        current_seller: "" // Người bán sản phẩm
    }
]);

export const sCoin = signify(JSON.parse(localStorage.getItem("point" + localStorage.getItem("LoginUser"))) || 0);
