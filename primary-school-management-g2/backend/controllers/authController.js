const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middlewares/authFilter');

// HÀM XỬ LÝ ĐĂNG NHẬP
const login = (req, res) => {
    const { username, password } = req.body;

    // Giả lập tài khoản đúng (Sau này nhóm bạn kết nối Database thì check trong DB)
    if (username === 'admin' && password === '123456') {
        // Đúng tài khoản -> Tạo một chiếc "Vé thông hành" (Token) có hạn 24 giờ
        const token = jwt.sign({ username: username }, JWT_SECRET, { expiresIn: '24h' });
        return res.json({ token: `Bearer ${token}` });
    }

    // Sai tài khoản
    return res.status(401).json({ message: "Tài khoản hoặc mật khẩu không chính xác!" });
};

// HÀM XỬ LÝ ĐĂNG XUẤT
const logout = (req, res) => {
    // JWT là cơ chế không lưu trạng thái trên Server, nên chỉ cần bảo Frontend tự xóa token ở máy họ là xong
    return res.json({ message: "Đăng xuất thành công! Hãy xóa token ở localStorage." });
};

module.exports = { login, logout };