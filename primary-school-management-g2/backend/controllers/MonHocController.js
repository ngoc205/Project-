// Tạo mảng dữ liệu ảo để chứa các môn học (Thay cho Database lúc này)
let danhSachMonHoc = [
    { id: 1, maMonHoc: "MH01", tenMonHoc: "Toán Học", soTiet: 45 },
    { id: 2, maMonHoc: "MH02", tenMonHoc: "Tiếng Việt", soTiet: 60 }
];

// 1. Lấy toàn bộ danh sách môn học
const getAllMonHoc = (req, res) => {
    res.json(danhSachMonHoc);
};

// 2. Thêm một môn học mới
const createMonHoc = (req, res) => {
    const { maMonHoc, tenMonHoc, soTiet } = req.body;
    const newId = danhSachMonHoc.length > 0 ? danhSachMonHoc[danhSachMonHoc.length - 1].id + 1 : 1;
    
    const newMonHoc = { id: newId, maMonHoc, tenMonHoc, soTiet };
    danhSachMonHoc.push(newMonHoc);
    res.status(201).json(newMonHoc);
};

// 3. Sửa thông tin môn học theo ID
const updateMonHoc = (req, res) => {
    const { id } = req.params;
    const { maMonHoc, tenMonHoc, soTiet } = req.body;

    const index = danhSachMonHoc.findIndex(item => item.id == id);
    if (index !== -1) {
        danhSachMonHoc[index] = { id: Number(id), maMonHoc, tenMonHoc, soTiet };
        return res.json(danhSachMonHoc[index]);
    }
    res.status(404).json({ message: "Không tìm thấy môn học cần sửa!" });
};

// 4. Xóa môn học theo ID
const deleteMonHoc = (req, res) => {
    const { id } = req.params;
    const index = danhSachMonHoc.findIndex(item => item.id == id);
    
    if (index !== -1) {
        danhSachMonHoc.splice(index, 1);
        return res.json({ message: "Xóa môn học thành công!" });
    }
    res.status(404).json({ message: "Không tìm thấy môn học để xóa!" });
};

module.exports = { getAllMonHoc, createMonHoc, updateMonHoc, deleteMonHoc };