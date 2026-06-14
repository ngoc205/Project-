const express = require('express');
const cors = require('cors');
const authController = require('./controllers/authController');
const monHocController = require('./controllers/MonHocController');
const { authFilter } = require('./middlewares/authFilter');

const app = express();
app.use(cors()); // Cho phép Frontend gọi sang mà không bị chặn lỗi CORS
app.use(express.json()); // Cho phép đọc dữ liệu JSON gửi lên từ Client

// --- KẾT NỐI ĐƯỜNG DẪN API ---

// API liên quan đến Đăng nhập (Ai cũng vào được công khai)
app.post('/api/auth/login', authController.login);
app.post('/api/auth/logout', authController.logout);

// API liên quan đến Môn Học (BẮT BUỘC phải đi qua "authFilter" kiểm tra vé mới được vào)
app.get('/api/mon-hoc', authFilter, monHocController.getAllMonHoc);
app.post('/api/mon-hoc', authFilter, monHocController.createMonHoc);
app.put('/api/mon-hoc/:id', authFilter, monHocController.updateMonHoc);
app.delete('/api/mon-hoc/:id', authFilter, monHocController.deleteMonHoc);

// Chạy server ở cổng 8080
const PORT = 8080;
app.listen(PORT, () => {
    console.log(`=== BACKEND ĐANG CHẠY TẠI: http://localhost:${PORT} ===`);
});

// Thêm đoạn này để trang chủ không bị lỗi "Cannot GET /"
app.get('/', (req, res) => {
    res.send("Chào mừng bạn đến với Backend của Trường Tiểu Học - G2!");
});