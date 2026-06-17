import { useEffect, useState } from 'react';
import api from '../api/axiosClient';

const emptyForm = {
  TaiKhoanID: '',
  HoTen: '',
  NgaySinh: '',
  SoDienThoai: '',
  DiaChi: '',
  AnhDaiDien: '',
  IsActive: true,
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

export default function AdminGiaoVienPage() {
  const [teachers, setTeachers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    const [teacherRes, accountRes] = await Promise.all([
      api.get('/api/giaovien'),
      api.get('/api/giaovien/options'),
    ]);
    setTeachers(teacherRes.data);
    setAccounts(accountRes.data);
  };

  useEffect(() => {
    loadData().catch((err) => {
      console.error('Lỗi tải danh sách giáo viên', err);
      alert('Không tải được danh sách giáo viên.');
    });
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const startEdit = (teacher) => {
    setEditingId(teacher.GiaoVienID);
    setForm({
      TaiKhoanID: teacher.TaiKhoanID || '',
      HoTen: teacher.HoTen || '',
      NgaySinh: formatDateInput(teacher.NgaySinh),
      SoDienThoai: teacher.SoDienThoai || '',
      DiaChi: teacher.DiaChi || '',
      AnhDaiDien: teacher.AnhDaiDien || '',
      IsActive: teacher.IsActive !== false,
    });
  };

  const submitForm = async (event) => {
    event.preventDefault();
    setLoading(true);

    const payload = {
      ...form,
      TaiKhoanID: form.TaiKhoanID ? Number(form.TaiKhoanID) : null,
    };

    try {
      if (editingId) {
        await api.put(`/api/giaovien/${editingId}`, payload);
        alert('Cập nhật giáo viên thành công!');
      } else {
        await api.post('/api/giaovien', payload);
        alert('Thêm giáo viên thành công!');
      }
      resetForm();
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Lưu giáo viên thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const deleteTeacher = async (teacher) => {
    if (!window.confirm(`Bạn có chắc muốn xóa giáo viên "${teacher.HoTen}"?`)) return;

    try {
      await api.delete(`/api/giaovien/${teacher.GiaoVienID}`);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Xóa giáo viên thất bại!');
    }
  };

  const accountOptions = editingId && form.TaiKhoanID
    ? [
        ...accounts,
        {
          TaiKhoanID: Number(form.TaiKhoanID),
          TenDangNhap: teachers.find((teacher) => teacher.GiaoVienID === editingId)?.TenDangNhap || `Tài khoản #${form.TaiKhoanID}`,
        },
      ].filter((account, index, arr) => arr.findIndex((item) => Number(item.TaiKhoanID) === Number(account.TaiKhoanID)) === index)
    : accounts;

  return (
    <div>
      <h2 style={{ marginBottom: '20px', color: '#1a365d' }}>Quản Trị: Quản Lý Giáo Viên</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '360px minmax(0, 1fr)', gap: '28px', alignItems: 'start' }}>
        <form onSubmit={submitForm} style={{ padding: '20px', background: '#f8fafc', borderRadius: '8px', display: 'grid', gap: '13px' }}>
          <h3 style={{ margin: 0 }}>{editingId ? 'Sửa giáo viên' : 'Thêm giáo viên'}</h3>

          <label>
            <span>Họ tên</span>
            <input
              style={{ ...inputStyle, marginTop: '6px' }}
              value={form.HoTen}
              required
              onChange={(e) => setForm({ ...form, HoTen: e.target.value })}
            />
          </label>

          <label>
            <span>Tài khoản đăng nhập</span>
            <select
              style={{ ...inputStyle, marginTop: '6px' }}
              value={form.TaiKhoanID}
              onChange={(e) => setForm({ ...form, TaiKhoanID: e.target.value })}
            >
              <option value="">Chưa gán tài khoản</option>
              {accountOptions.map((account) => (
                <option key={account.TaiKhoanID} value={account.TaiKhoanID}>
                  {account.TenDangNhap}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Ngày sinh</span>
            <input
              type="date"
              style={{ ...inputStyle, marginTop: '6px' }}
              value={form.NgaySinh}
              onChange={(e) => setForm({ ...form, NgaySinh: e.target.value })}
            />
          </label>

          <label>
            <span>Số điện thoại</span>
            <input
              style={{ ...inputStyle, marginTop: '6px' }}
              value={form.SoDienThoai}
              onChange={(e) => setForm({ ...form, SoDienThoai: e.target.value })}
            />
          </label>

          <label>
            <span>Địa chỉ</span>
            <input
              style={{ ...inputStyle, marginTop: '6px' }}
              value={form.DiaChi}
              onChange={(e) => setForm({ ...form, DiaChi: e.target.value })}
            />
          </label>

          <label>
            <span>Ảnh đại diện</span>
            <input
              style={{ ...inputStyle, marginTop: '6px' }}
              value={form.AnhDaiDien}
              placeholder="ten-file.png"
              onChange={(e) => setForm({ ...form, AnhDaiDien: e.target.value })}
            />
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={form.IsActive}
              onChange={(e) => setForm({ ...form, IsActive: e.target.checked })}
            />
            Đang hoạt động
          </label>

          <button type="submit" className="primary-button" disabled={loading}>
            {editingId ? 'Lưu thay đổi' : 'Thêm mới'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} style={{ padding: '10px', cursor: 'pointer' }}>
              Hủy
            </button>
          )}
        </form>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '900px', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Họ tên</th>
                <th style={thStyle}>Tài khoản</th>
                <th style={thStyle}>Ngày sinh</th>
                <th style={thStyle}>SĐT</th>
                <th style={thStyle}>Lớp CN</th>
                <th style={thStyle}>Trạng thái</th>
                <th style={thStyle}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher) => (
                <tr key={teacher.GiaoVienID}>
                  <td style={tdStyle}>{teacher.GiaoVienID}</td>
                  <td style={tdStyle}>
                    <strong>{teacher.HoTen}</strong>
                    {teacher.DiaChi && <div style={{ color: '#64748b', marginTop: '4px' }}>{teacher.DiaChi}</div>}
                  </td>
                  <td style={tdStyle}>{teacher.TenDangNhap || '-'}</td>
                  <td style={tdStyle}>{formatDateView(teacher.NgaySinh)}</td>
                  <td style={tdStyle}>{teacher.SoDienThoai || '-'}</td>
                  <td style={tdStyle}>{teacher.LopChuNhiem || '-'}</td>
                  <td style={tdStyle}>{teacher.IsActive ? 'Hoạt động' : 'Tạm khóa'}</td>
                  <td style={tdStyle}>
                    <button onClick={() => startEdit(teacher)} style={{ marginRight: '10px', color: 'blue', cursor: 'pointer', background: 'none', border: 'none' }}>
                      Sửa
                    </button>
                    <button onClick={() => deleteTeacher(teacher)} style={{ color: 'red', cursor: 'pointer', background: 'none', border: 'none' }}>
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
              {teachers.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ ...tdStyle, textAlign: 'center', color: '#64748b' }}>
                    Chưa có giáo viên.
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
