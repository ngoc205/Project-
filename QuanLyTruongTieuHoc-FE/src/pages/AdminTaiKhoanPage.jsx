import React, { useEffect, useState } from 'react';
import api from '../api/axiosClient';

// Cấu trúc Form chuẩn khớp 100% với các cột trong bảng GiaoVien và TaiKhoan của bạn
const emptyForm = {
  // Bảng GiaoVien
  HoTen: '',
  NgaySinh: '',
  SoDienThoai: '',
  DiaChi: '',
  AnhDaiDien: '',
  IsActive: true,
  
  // Bảng TaiKhoan (Tạo kèm khi thêm mới)
  TenDangNhap: '',
  MatKhau: '',
  VaiTro: 'GiaoVien', // 'GiaoVien' hoặc 'CanBo' theo CHECK CONSTRAINT của DB
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #cbd5e1',
  borderRadius: '6px',
  boxSizing: 'border-box',
};

const thStyle = {
  padding: '12px',
  border: '1px solid #dbe3ef',
  background: '#2b6cb0',
  color: 'white',
  textAlign: 'left',
};

const tdStyle = {
  padding: '12px',
  border: '1px solid #e2e8f0',
  verticalAlign: 'top',
};

function formatDateInput(value) {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
}

function formatDateView(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('vi-VN');
}

export default function AdminPersonnelPage() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null); // Lưu GiaoVienID khi sửa
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // ==========================================
  // 1. API XEM (LẤY DANH SÁCH TỪ BACKEND)
  // ==========================================
  const loadData = async () => {
    try {
      // Gọi endpoint BE quản lý giáo viên/cán bộ gộp
      const response = await api.get('/api/giaovien');
      setList(response.data || []);
    } catch (err) {
      console.error('Lỗi tải danh sách:', err);
      alert('Không tải được danh sách nhân sự từ Database.');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  // Kích hoạt form Cập nhật (Sửa)
  const startEdit = (item) => {
    setEditingId(item.GiaoVienID);
    setForm({
      HoTen: item.HoTen || '',
      NgaySinh: item.NgaySinh ? formatDateInput(item.NgaySinh) : '',
      SoDienThoai: item.SoDienThoai || '',
      DiaChi: item.DiaChi || '',
      AnhDaiDien: item.AnhDaiDien || '',
      IsActive: item.IsActive !== false,
      
      // Khi sửa thông tin cá nhân, thường giữ nguyên tài khoản
      TenDangNhap: item.taiKhoan?.TenDangNhap || item.TenDangNhap || '',
      MatKhau: '', 
      VaiTro: item.taiKhoan?.VaiTro || item.VaiTro || 'GiaoVien',
    });
  };

  // ==========================================
  // 2. API TÌM KIẾM
  // ==========================================
  const handleSearch = async (keyword) => {
    setSearch(keyword);
    if (keyword.trim() === '') {
      loadData();
      return;
    }
    try {
      // Gọi đúng API tìm kiếm theo yêu cầu BE của bạn
      const response = await api.get(`/api/giaovien/search?keyword=${keyword}`);
      setList(response.data || []);
    } catch (error) {
      console.error("Lỗi tìm kiếm:", error);
    }
  };

  // ==========================================
  // 3. API THÊM MỚI + TẠO TÀI KHOẢN / CẬP NHẬT
  // ==========================================
  const submitForm = async (event) => {
    event.preventDefault();
    setLoading(true);

    // Đóng gói dữ liệu chuẩn tên cột Database viết hoa
    const payload = {
      HoTen: form.HoTen,
      NgaySinh: form.NgaySinh || null,
      SoDienThoai: form.SoDienThoai || null,
      DiaChi: form.DiaChi || null,
      AnhDaiDien: form.AnhDaiDien || null,
      IsActive: form.IsActive,
      
      // Thông tin tài khoản đi kèm
      TenDangNhap: form.TenDangNhap,
      MatKhau: form.MatKhau,
      VaiTro: form.VaiTro
    };

    try {
      if (editingId) {
        // --- API CẬP NHẬT (SỬA) ---
        await api.put(`/api/giaovien/${editingId}`, payload);
        alert('Cập nhật thông tin nhân sự thành công!');
      } else {
        // --- API THÊM MỚI + TẠO TÀI KHOẢN ---
        if (!form.TenDangNhap || !form.MatKhau) {
          alert("Vui lòng nhập đầy đủ Tên đăng nhập và Mật khẩu để hệ thống tạo tài khoản!");
          setLoading(false);
          return;
        }
        await api.post('/api/giaovien', payload);
        alert('Thêm mới nhân sự và tạo tài khoản thành công!');
      }
      resetForm();
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Thao tác thất bại! Kiểm tra xem tên đăng nhập có bị trùng không.');
    } finally {
      setLoading(false);
    }
  };

  // Xóa nhân sự
  const deleteItem = async (item) => {
    if (!window.confirm(`Bạn có chắc muốn xóa nhân sự "${item.HoTen}"?`)) return;
    try {
      await api.delete(`/api/giaovien/${item.GiaoVienID}`);
      alert('Xóa thành công!');
      await loadData();
    } catch (err) {
      alert('Xóa thất bại!');
    }
  };

  return (
    <div style={{ padding: '10px' }}>
      <h2 style={{ marginBottom: '20px', color: '#1a365d' }}>Quản Lý Cán Bộ & Giáo Viên (Đồng bộ DB)</h2>

      {/* THANH TÌM KIẾM */}
      <div style={{ display: 'flex', gap: '30px', marginBottom: '20px' }}>
        <input
          placeholder="🔍 Tìm kiếm nhân sự theo họ tên..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          style={{
            padding: '10px 15px',
            width: '100%',
            maxWidth: '500px',
            borderRadius: '6px',
            border: '1px solid #cbd5e0',
            outline: 'none',
            fontSize: '14px'
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px minmax(0, 1fr)', gap: '28px', alignItems: 'start' }}>
        
        {/* FORM THAO TÁC (THÊM / CẬP NHẬT) */}
        <form onSubmit={submitForm} style={{ padding: '20px', background: '#f8fafc', borderRadius: '8px', display: 'grid', gap: '13px' }}>
          <h3 style={{ margin: 0, color: '#2d3748' }}>
            {editingId ? '💾 Cập Nhật Nhân Sự' : '➕ Thêm Mới & Tạo Tài Khoản'}
          </h3>

          <h4 style={{ margin: '5px 0 0 0', color: '#4a5568', borderBottom: '1px solid #e2e8f0', paddingBottom: '5px' }}>Thông Tin Cá Nhân</h4>
          
          <label>
            <span style={{ fontSize: '13px', fontWeight: '500' }}>Họ và tên *</span>
            <input
              style={{ ...inputStyle, marginTop: '4px' }}
              value={form.HoTen}
              required
              onChange={(e) => setForm({ ...form, HoTen: e.target.value })}
            />
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <label>
              <span style={{ fontSize: '13px', fontWeight: '500' }}>Ngày sinh</span>
              <input
                type="date"
                style={{ ...inputStyle, marginTop: '4px' }}
                value={form.NgaySinh}
                onChange={(e) => setForm({ ...form, NgaySinh: e.target.value })}
              />
            </label>
            <label>
              <span style={{ fontSize: '13px', fontWeight: '500' }}>Số điện thoại</span>
              <input
                style={{ ...inputStyle, marginTop: '4px' }}
                value={form.SoDienThoai}
                onChange={(e) => setForm({ ...form, SoDienThoai: e.target.value })}
              />
            </label>
          </div>

          <label>
            <span style={{ fontSize: '13px', fontWeight: '500' }}>Địa chỉ thường trú</span>
            <input
              style={{ ...inputStyle, marginTop: '4px' }}
              value={form.DiaChi}
              onChange={(e) => setForm({ ...form, DiaChi: e.target.value })}
            />
          </label>

          <label>
            <span style={{ fontSize: '13px', fontWeight: '500' }}>Tên file ảnh đại diện</span>
            <input
              style={{ ...inputStyle, marginTop: '4px' }}
              value={form.AnhDaiDien}
              placeholder="example.png"
              onChange={(e) => setForm({ ...form, AnhDaiDien: e.target.value })}
            />
          </label>

          {/* KHU VỰC TẠO TÀI KHOẢN đi kèm */}
          <h4 style={{ margin: '10px 0 0 0', color: '#4a5568', borderBottom: '1px solid #e2e8f0', paddingBottom: '5px' }}>Thông Tin Tài Khoản Hệ Thống</h4>

          <label>
            <span style={{ fontSize: '13px', fontWeight: '500' }}>Vai trò hệ thống (CHECK Constraint)</span>
            <select
              style={{ ...inputStyle, marginTop: '4px' }}
              value={form.VaiTro}
              onChange={(e) => setForm({ ...form, VaiTro: e.target.value })}
            >
              <option value="GiaoVien">👩‍🏫 Giáo Viên Bộ Môn</option>
              <option value="CanBo">💼 Cán Bộ / Người Quản Lý</option>
            </select>
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <label>
              <span style={{ fontSize: '13px', fontWeight: '500' }}>Tên đăng nhập *</span>
              <input
                style={{ ...inputStyle, marginTop: '4px' }}
                value={form.TenDangNhap}
                disabled={!!editingId} // Sửa thông tin cá nhân không cho đổi tên đăng nhập tránh lỗi logic
                required={!editingId}
                onChange={(e) => setForm({ ...form, TenDangNhap: e.target.value })}
              />
            </label>
            <label>
              <span style={{ fontSize: '13px', fontWeight: '500' }}>{editingId ? 'Mật khẩu mới' : 'Mật khẩu *'}</span>
              <input
                type="text" // Hiện text thô trực tiếp giống đặc tả của bạn
                style={{ ...inputStyle, marginTop: '4px' }}
                value={form.MatKhau}
                placeholder={editingId ? "Bỏ trống nếu giữ cũ" : "Nhập pass thô"}
                required={!editingId}
                onChange={(e) => setForm({ ...form, MatKhau: e.target.value })}
              />
            </label>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '5px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={form.IsActive}
              onChange={(e) => setForm({ ...form, IsActive: e.target.checked })}
            />
            <span style={{ fontSize: '14px' }}>Kích hoạt trạng thái (IsActive)</span>
          </label>

          <button type="submit" style={{ padding: '10px', background: '#2b6cb0', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }} disabled={loading}>
            {editingId ? '💾 Lưu Cập Nhật' : '➕ Lưu & Tạo Toàn Bộ'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} style={{ padding: '10px', cursor: 'pointer', background: '#cbd5e0', border: 'none', borderRadius: '6px' }}>
              Hủy bỏ
            </button>
          )}
        </form>

        {/* BẢNG HIỂN THỊ */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '900px', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr>
                <th style={thStyle}>GiaoVienID</th>
                <th style={thStyle}>Họ và tên</th>
                <th style={thStyle}>Ngày sinh</th>
                <th style={thStyle}>Số điện thoại</th>
                <th style={thStyle}>Tài khoản liên kết</th>
                <th style={thStyle}>Vai trò (Phân loại)</th>
                <th style={thStyle}>Trạng thái</th>
                <th style={thStyle}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {list.map((item, index) => {
                const headAccount = item.taiKhoan || item;
                const laCanBo = headAccount.VaiTro === 'CanBo';

                return (
                  <tr key={index}>
                    <td style={tdStyle}>{item.GiaoVienID}</td>
                    <td style={tdStyle}>
                      <strong>{item.HoTen}</strong>
                      {item.DiaChi && <div style={{ color: '#64748b', fontSize: '12px', marginTop: '4px' }}>📍 {item.DiaChi}</div>}
                    </td>
                    <td style={tdStyle}>{formatDateView(item.NgaySinh)}</td>
                    <td style={tdStyle}>{item.SoDienThoai || '-'}</td>
                    <td style={tdStyle}>
                      <code>{headAccount.TenDangNhap || 'Chưa gán'}</code>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ fontWeight: '600', color: laCanBo ? '#c53030' : '#2b6cb0' }}>
                        {laCanBo ? '💼 Quản Lý / Cán Bộ' : '👩‍🏫 Giáo Viên'}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ color: item.IsActive ? '#2f855a' : '#c53030', fontWeight: '500' }}>
                        {item.IsActive ? 'Active' : 'Locked'}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <button onClick={() => startEdit(item)} style={{ marginRight: '12px', color: '#2b6cb0', cursor: 'pointer', background: 'none', border: 'none', fontWeight: '500' }}>
                        Sửa
                      </button>
                      <button onClick={() => deleteItem(item)} style={{ color: '#c53030', cursor: 'pointer', background: 'none', border: 'none', fontWeight: '500' }}>
                        Xóa
                      </button>
                    </td>
                  </tr>
                );
              })}
              {list.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ ...tdStyle, textAlign: 'center', color: '#64748b', padding: '40px' }}>
                    Không tìm thấy bản ghi nào khớp trong Database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}