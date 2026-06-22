import React, { useEffect, useState } from 'react';
import api from '../api/axiosClient';
import Swal from 'sweetalert2';

// Khởi tạo Form chuẩn theo đúng các cột của bảng GiaoVien
const emptyForm = {
  HoTen: '',
  NgaySinh: '',
  SoDienThoai: '',
  DiaChi: '',
  AnhDaiDien: '',
  IsActive: true,
  ChucVuChiTiet: 'GiaoVienBoMon', // Chỉ dùng để phân loại hiển thị thông tin nhân sự
};

const LIST_CHUC_VU = [
  { id: 'GiaoVienBoMon', name: '👩‍🏫 Giáo Viên Bộ Môn' },
  { id: 'GiaoVienChuNhiem', name: '👩‍🏫 Giáo Viên Chủ Nhiệm' },
  { id: 'HieuTruong', name: '💼 Ban Giám Hiệu (Hiệu Trưởng/Phó Hiệu)' },
  { id: 'KeToan', name: '💵 Kế Toán / Thủ Quỹ' },
  { id: 'QuanLyThuVien', name: '📚 Cán Bộ Thư Viện' },
  { id: 'YTeTruongHoc', name: '🩺 Cán Bộ Y Tế' },
  { id: 'QuanTriHeThong', name: '💻 Quản Trị Viên Hệ Thống (IT)' },
  { id: 'BaoVe', name: '🛡️ Nhân Viên Bảo Vệ' },
];

export default function AdminPersonnelPage() {
  const [list, setList] = useState([]); // Danh sách gốc từ DB
  const [filteredList, setFilteredList] = useState([]); // Danh sách sau khi lọc tìm kiếm
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Hàm loại bỏ dấu tiếng Việt để phục vụ tìm kiếm chuẩn xác ở Client
  const removeVietnameseTones = (str) => {
    if (!str) return '';
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .trim();
  };

  const loadData = async () => {
    try {
      const response = await api.get('/api/giaovien');
      const data = response.data || [];
      setList(data);
      setFilteredList(data);
    } catch (err) {
      console.error('Lỗi tải danh sách giáo viên:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  // ==========================================
  // XỬ LÝ TÌM KIẾM THEO HỌ TÊN HOẶC SỐ ĐIỆN THOẠI
  // ==========================================
  const handleSearch = async (keyword) => {
    setSearch(keyword);
    
    if (keyword.trim() === '') {
      setFilteredList(list);
      return;
    }

    // Lọc nhanh ngay tại Client
    const normalizedKeyword = removeVietnameseTones(keyword);
    const clientFiltered = list.filter(item => {
      const nameMatch = removeVietnameseTones(item.HoTen).includes(normalizedKeyword);
      const phoneMatch = item.SoDienThoai && item.SoDienThoai.includes(keyword);
      const addressMatch = item.DiaChi && removeVietnameseTones(item.DiaChi).includes(normalizedKeyword);
      return nameMatch || phoneMatch || addressMatch;
    });
    setFilteredList(clientFiltered);

    // Gọi API dự phòng nếu Backend có hỗ trợ tìm kiếm nâng cao
    try {
      const response = await api.get(`/api/giaovien/search?keyword=${encodeURIComponent(keyword)}`);
      if (response.data && response.data.length > 0) {
        setFilteredList(response.data);
      }
    } catch (error) {
      console.log("Đang tìm kiếm tối ưu bằng bộ lọc Client");
    }
  };

  // ==========================================
  // THAO TÁC LƯU DỮ LIỆU (THÊM / SỬA GIÁO VIÊN)
  // ==========================================
  const submitForm = async (event) => {
    event.preventDefault();
    setLoading(true);

    // Payload map chuẩn xác 100% các cột trong bảng GiaoVien của SQL Server
    const payload = {
      HoTen: form.HoTen,
      NgaySinh: form.NgaySinh || null,
      SoDienThoai: form.SoDienThoai || null,
      DiaChi: form.DiaChi || null,
      AnhDaiDien: form.AnhDaiDien || null,
      IsActive: form.IsActive,
      // Lưu thông tin chức vụ chi tiết nếu backend của bạn có thiết kế cột này, nếu không có thể bỏ qua
      ChucVuChiTiet: form.ChucVuChiTiet 
    };

    try {
      if (editingId) {
        await api.put(`/api/giaovien/${editingId}`, payload);
        Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: 'Cập nhật thông tin nhân sự thành công.',
          timer: 1800,
          showConfirmButton: false
        });
      } else {
        await api.post('/api/giaovien', payload);
        Swal.fire({
          icon: 'success',
          title: 'Đã thêm mới!',
          text: 'Thêm hồ sơ nhân sự mới thành công.',
          timer: 1800,
          showConfirmButton: false
        });
      }
      setSearch('');
      resetForm();
      await loadData();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Thao tác thất bại!',
        text: err.response?.data?.message || 'Vui lòng kiểm tra lại kết nối hoặc dữ liệu đầu vào.',
      });
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (item) => {
    setEditingId(item.GiaoVienID);
    setForm({
      HoTen: item.HoTen || '',
      NgaySinh: item.NgaySinh ? new Date(item.NgaySinh).toISOString().slice(0, 10) : '',
      SoDienThoai: item.SoDienThoai || '',
      DiaChi: item.DiaChi || '',
      AnhDaiDien: item.AnhDaiDien || '',
      IsActive: item.IsActive !== false,
      ChucVuChiTiet: item.ChucVuChiTiet || 'GiaoVienBoMon'
    });
  };

  // ==========================================
  // THAO TÁC XÓA HỒ SƠ NHÂN SỰ
  // ==========================================
  const deleteItem = async (item) => {
    Swal.fire({
      title: 'Bạn có chắc chắn?',
      text: `Hồ sơ của nhân sự "${item.HoTen}" sẽ bị xóa hoàn toàn khỏi hệ thống!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Đồng ý xóa',
      cancelButtonText: 'Hủy bỏ'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/api/giaovien/${item.GiaoVienID}`);
          Swal.fire({
            icon: 'success',
            title: 'Đã xóa!',
            text: 'Hồ sơ nhân sự đã được gỡ bỏ khỏi hệ thống.',
            timer: 1500,
            showConfirmButton: false
          });
          setSearch('');
          await loadData();
        } catch (err) {
          Swal.fire({
            icon: 'error',
            title: 'Không thể xóa!',
            text: 'Bản ghi này hiện đang vướng ràng buộc lịch dạy, phân công hoặc lớp học trong Database.',
          });
        }
      }
    });
  };

  const openDetailModal = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  return (
    <div style={{ padding: '24px', fontFamily: '"Segoe UI", Roboto, sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      
      {/* HEADER DỰ ÁN */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '24px', fontWeight: '600' }}>Hệ Thống Quản Lý Thông Tin Nhân Sự</h2>
        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Quản lý danh sách hồ sơ lý lịch cán bộ, giáo viên và nhân viên nhà trường.</p>
      </div>

      {/* THANH TÌM KIẾM */}
      <div style={{ marginBottom: '24px' }}>
        <input
          placeholder="🔍 Tìm nhanh nhân sự theo Họ tên, Số điện thoại, Địa chỉ..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          style={{
            padding: '12px 16px',
            width: '100%',
            maxWidth: '500px',
            borderRadius: '8px',
            border: '2px solid #3b82f6',
            outline: 'none',
            fontSize: '14px',
            boxShadow: '0 2px 4px rgba(59, 130, 246, 0.1)'
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '390px minmax(0, 1fr)', gap: '24px', alignItems: 'start' }}>
        
        {/* FORM THAO TÁC (CHỈ THÊM/SỬA THÔNG TIN NHÂN SỰ) */}
        <form onSubmit={submitForm} style={{ padding: '24px', background: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', display: 'grid', gap: '16px' }}>
          <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px', fontWeight: '600', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
            {editingId ? '📝 Cập Nhật Hồ Sơ' : '➕ Thêm Nhân Sự Mới'}
          </h3>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#344054', marginBottom: '6px' }}>Họ và tên *</label>
            <input
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #d0d5dd', borderRadius: '6px', boxSizing: 'border-box' }}
              value={form.HoTen}
              required
              placeholder="Ví dụ: Nguyễn Văn A"
              onChange={(e) => setForm({ ...form, HoTen: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#344054', marginBottom: '6px' }}>Ngày sinh</label>
              <input
                type="date"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d0d5dd', borderRadius: '6px', boxSizing: 'border-box' }}
                value={form.NgaySinh}
                onChange={(e) => setForm({ ...form, NgaySinh: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#344054', marginBottom: '6px' }}>Số điện thoại</label>
              <input
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d0d5dd', borderRadius: '6px', boxSizing: 'border-box' }}
                value={form.SoDienThoai}
                placeholder="0987xxxxxx"
                onChange={(e) => setForm({ ...form, SoDienThoai: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#344054', marginBottom: '6px' }}>Địa chỉ thường trú</label>
            <input
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #d0d5dd', borderRadius: '6px', boxSizing: 'border-box' }}
              value={form.DiaChi}
              placeholder="Số nhà, Đường, Tỉnh/Thành phố"
              onChange={(e) => setForm({ ...form, DiaChi: e.target.value })}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#344054', marginBottom: '6px' }}>Ảnh đại diện (Tên file / URL)</label>
            <input
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #d0d5dd', borderRadius: '6px', boxSizing: 'border-box' }}
              value={form.AnhDaiDien}
              placeholder="avatar.png hoặc link ảnh"
              onChange={(e) => setForm({ ...form, AnhDaiDien: e.target.value })}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#344054', marginBottom: '6px' }}>Chức danh / Vị trí công tác</label>
            <select
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #d0d5dd', borderRadius: '6px', boxSizing: 'border-box', backgroundColor: '#fff', fontSize: '14px' }}
              value={form.ChucVuChiTiet}
              onChange={(e) => setForm({ ...form, ChucVuChiTiet: e.target.value })}
            >
              {LIST_CHUC_VU.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '4px' }}>
            <input
              type="checkbox"
              checked={form.IsActive}
              onChange={(e) => setForm({ ...form, IsActive: e.target.checked })}
            />
            <span style={{ fontSize: '14px', color: '#344054', fontWeight: '500' }}>Kích hoạt trạng thái làm việc (Active)</span>
          </label>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button type="submit" style={{ flex: 1, padding: '10px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }} disabled={loading}>
              {editingId ? '💾 Lưu Thay Đổi' : '➕ Thêm Nhân Sự'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} style={{ padding: '10px 16px', background: '#cbd5e1', color: '#334155', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                Hủy
              </button>
            )}
          </div>
        </form>

        {/* BẢNG HIỂN THỊ DANH SÁCH NHÂN SỰ */}
        <div style={{ background: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '14px 16px', color: '#475569', fontWeight: '600' }}>ID Nhân Viên</th>
                <th style={{ padding: '14px 16px', color: '#475569', fontWeight: '600' }}>Họ và tên</th>
                <th style={{ padding: '14px 16px', color: '#475569', fontWeight: '600' }}>Số điện thoại</th>
                <th style={{ padding: '14px 16px', color: '#475569', fontWeight: '600' }}>Địa chỉ</th>
                <th style={{ padding: '14px 16px', color: '#475569', fontWeight: '600' }}>Vị trí công tác</th>
                <th style={{ padding: '14px 16px', color: '#475569', fontWeight: '600' }}>Trạng thái</th>
                <th style={{ padding: '14px 16px', color: '#475569', fontWeight: '600' }}>Hành động</th>
              </tr>
            </thead>
            <tbody style={{ color: '#334155' }}>
              {filteredList.map((item) => {
                const jobObj = LIST_CHUC_VU.find(j => j.id === item.ChucVuChiTiet) || { name: '👩‍🏫 Giáo Viên Bộ Môn' };

                return (
                  <tr key={item.GiaoVienID} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px', fontWeight: '500' }}>#{item.GiaoVienID}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span onClick={() => openDetailModal(item)} style={{ fontWeight: '600', color: '#2563eb', cursor: 'pointer', textDecoration: 'underline' }}>
                        {item.HoTen}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>{item.SoDienThoai || '-'}</td>
                    <td style={{ padding: '14px 16px', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.DiaChi || '-'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', background: '#eff6ff', color: '#2563eb' }}>
                        {jobObj.name}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ color: item.IsActive ? '#10b981' : '#f43f5e', fontWeight: '600' }}>
                        {item.IsActive ? '● Active' : '● Tạm nghỉ'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <button onClick={() => startEdit(item)} style={{ border: 'none', background: 'none', color: '#059669', fontWeight: '600', cursor: 'pointer', marginRight: '12px' }}>Sửa</button>
                      <button onClick={() => deleteItem(item)} style={{ border: 'none', background: 'none', color: '#dc2626', fontWeight: '600', cursor: 'pointer' }}>Xóa</button>
                    </td>
                  </tr>
                );
              })}
              {filteredList.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>Không tìm thấy nhân sự trùng khớp.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* POPUP XEM CHI TIẾT LÝ LỊCH TRÍCH NGANG */}
      {isModalOpen && selectedItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '450px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px', fontWeight: '600' }}>Hồ Sơ Lý Lịch Chi Tiết</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
            </div>

            <div style={{ display: 'grid', gap: '12px', fontSize: '14px', color: '#334155' }}>
              <div><strong style={{ color: '#475569' }}>Mã Nhân Viên (ID):</strong> #{selectedItem.GiaoVienID}</div>
              <div><strong style={{ color: '#475569' }}>Họ và tên:</strong> <span style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>{selectedItem.HoTen}</span></div>
              <div><strong style={{ color: '#475569' }}>Ngày sinh:</strong> {selectedItem.NgaySinh ? new Date(selectedItem.NgaySinh).toLocaleDateString('vi-VN') : '-'}</div>
              <div><strong style={{ color: '#475569' }}>Số điện thoại:</strong> {selectedItem.SoDienThoai || '-'}</div>
              <div><strong style={{ color: '#475569' }}>Địa chỉ thường trú:</strong> {selectedItem.DiaChi || '-'}</div>
              <div><strong style={{ color: '#475569' }}>File Ảnh đại diện:</strong> {selectedItem.AnhDaiDien || 'Chưa cập nhật'}</div>
              <div><strong style={{ color: '#475569' }}>Vị trí công tác:</strong> {LIST_CHUC_VU.find(j => j.id === selectedItem.ChucVuChiTiet)?.name || 'Giáo Viên Bộ Môn'}</div>
              <div><strong style={{ color: '#475569' }}>Trạng thái nhân sự:</strong> {selectedItem.IsActive ? '🟢 Đang làm việc' : '🔴 Tạm khóa / Nghỉ việc'}</div>
            </div>

            <button onClick={() => setIsModalOpen(false)} style={{ width: '100%', marginTop: '20px', padding: '10px', background: '#64748b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
              Đóng Popup
            </button>

          </div>
        </div>
      )}

    </div>
  );
}