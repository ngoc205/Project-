const jwt = require('jsonwebtoken');
const JWT_SECRET = "BiMatCuaDuAnG2"; // Chìa khóa bí mật để tạo vé

const authFilter = (req, res, next) => {
    // 1. Lấy token từ header "Authorization" mà Frontend gửi lên
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Cắt bỏ chữ "Bearer " để lấy chuỗi mã

    // 2. Nếu không có vé (token) -> Báo lỗi ngay
    if (!token) {
        return res.status(401).json({ message: "Bạn không có quyền truy cập! Vui lòng đăng nhập." });
    }

    // 3. Nếu có vé -> Kiểm tra xem vé thật hay giả, hết hạn chưa
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Vé (Token) không hợp lệ hoặc đã hết hạn!" });
        }
        req.user = user; // Lưu thông tin người dùng lại để dùng nếu cần
        next(); // Vé chuẩn -> Cho phép đi tiếp vào trong
    });
};

module.exports = { authFilter, JWT_SECRET };