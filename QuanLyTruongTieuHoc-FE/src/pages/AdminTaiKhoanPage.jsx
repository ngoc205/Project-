import { useState, useEffect } from 'react';
import api from '../api/axiosClient';
import { useNotification } from '../components/NotificationProvider';

export default function AdminTaiKhoanPage() {
  const { showError, showSuccess } = useNotification();
  const [taiKhoans, setTaiKhoans] = useState([]);
  const [formData, setFormData] = useState({ TenDangNhap: '', MatKhau: '', VaiTro: 'GiaoVien' });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const fetchTaiKhoans = async () => {
    try {
      const res = await api.get('/tai-khoan');
      setTaiKhoans(res.data);
    } catch (err) {
      console.error('Lỗi tải danh sách tài khoản', err);
    }
  };

  useEffect(() => {
    fetchTaiKhoans();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/tai-khoan/${editId}`, formData);
        showSuccess('Cập nhật tài khoản thành công!');
      } else {
        await api.post('/tai-khoan', formData);
        showSuccess('Thêm tài khoản thành công!');
      }
      setFormData({ TenDangNhap: '', MatKhau: '', VaiTro: 'GiaoVien' });
      setIsEditing(false);
      setEditId(null);
      fetchTaiKhoans();
    } catch (err) {
      showError('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa tài khoản này?')) {
      try {
        await api.delete(`/tai-khoan/${id}`);
        showSuccess('Xóa tài khoản thành công!');
        fetchTaiKhoans();
      } catch (err) {
        console.error('Lỗi khi xóa tài khoản', err);
        showError('Lỗi khi xóa tài khoản');
      }
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '20px', color: '#1a365d' }}>Quản Trị: Quản Lý Tài Khoản</h2>

      <div style={{ display: 'flex', gap: '30px' }}>
        <div style={{ flex: '1', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
          <h3>{isEditing ? 'Sửa Tài Khoản' : 'Thêm Tài Khoản'}</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
            <input
              type="text"
              placeholder="Tên đăng nhập"
              required
              style={{ padding: '8px' }}
              value={formData.TenDangNhap}
              onChange={e => setFormData({ ...formData, TenDangNhap: e.target.value })}
            />
            <input
              type="text"
              placeholder="Mật khẩu (Plain text)"
              required
              style={{ padding: '8px' }}
              value={formData.MatKhau}
              onChange={e => setFormData({ ...formData, MatKhau: e.target.value })}
            />
            <select
              value={formData.VaiTro}
              onChange={e => setFormData({ ...formData, VaiTro: e.target.value })}
              style={{ padding: '8px' }}
            >
              <option value="GiaoVien">Giáo Viên</option>
              <option value="CanBo">Cán Bộ</option>
            </select>
            <button type="submit" className="primary-button">{isEditing ? 'Lưu thay đổi' : 'Thêm mới'}</button>
            {isEditing && (
              <button type="button" onClick={() => { setIsEditing(false); setFormData({ TenDangNhap: '', MatKhau: '', VaiTro: 'GiaoVien' }) }} style={{ padding: '8px' }}>Hủy</button>
            )}
          </form>
        </div>

        <div style={{ flex: '3' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#2b6cb0', color: 'white' }}>
                <th style={{ padding: '12px', border: '1px solid #ddd' }}>ID</th>
                <th style={{ padding: '12px', border: '1px solid #ddd' }}>Tên Đăng Nhập</th>
                <th style={{ padding: '12px', border: '1px solid #ddd' }}>Vai Trò</th>
                <th style={{ padding: '12px', border: '1px solid #ddd' }}>Ngày Tạo</th>
                <th style={{ padding: '12px', border: '1px solid #ddd' }}>Cập Nhật</th>
                <th style={{ padding: '12px', border: '1px solid #ddd' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {taiKhoans.map(tk => (
                <tr key={tk.TaiKhoanID}>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>{tk.TaiKhoanID}</td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>{tk.TenDangNhap}</td>
                  <td style={{ padding: '12px', border: '1px solid #ddd', fontWeight: 'bold', color: tk.VaiTro === 'CanBo' ? 'red' : 'green' }}>{tk.VaiTro}</td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                    {tk.NgayTao ? new Date(tk.NgayTao).toLocaleDateString('vi-VN') : ''}
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                    {tk.NgayCapNhat ? new Date(tk.NgayCapNhat).toLocaleDateString('vi-VN') : ''}
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                    <button onClick={() => { setIsEditing(true); setEditId(tk.TaiKhoanID); setFormData({ TenDangNhap: tk.TenDangNhap, MatKhau: tk.MatKhau, VaiTro: tk.VaiTro }) }} style={{ marginRight: '10px', color: 'blue', cursor: 'pointer', background: 'none', border: 'none' }}>Sửa</button>
                    <button onClick={() => handleDelete(tk.TaiKhoanID)} style={{ color: 'red', cursor: 'pointer', background: 'none', border: 'none' }}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
