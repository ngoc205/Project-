import { useState, useEffect } from 'react';
import api from '../api/axiosClient';

export default function AdminMonHocPage() {
  const [monHocs, setMonHocs] = useState([]);
  const [formData, setFormData] = useState({
    TenMonHoc: '',
    SoTiet: '',
    MoTa: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const fetchMonHocs = async () => {
    try {
      const res = await api.get('/mon-hoc');
      setMonHocs(res.data);
    } catch (err) {
      console.error('Lỗi tải danh sách môn học', err);
    }
  };

  useEffect(() => {
    fetchMonHocs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        TenMonHoc: formData.TenMonHoc,
        SoTiet: Number(formData.SoTiet),
        MoTa: formData.MoTa,
      };

      if (isEditing) {
        await api.put(`/mon-hoc/${editId}`, payload);
        alert('Cập nhật thành công!');
      } else {
        await api.post('/mon-hoc', payload);
        alert('Thêm mới thành công!');
      }

      setFormData({ TenMonHoc: '', SoTiet: '', MoTa: '' });
      setIsEditing(false);
      setEditId(null);
      fetchMonHocs();
    } catch (err) {
      alert('Có lỗi xảy ra: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (monHoc) => {
    setFormData({
      TenMonHoc: monHoc.TenMonHoc,
      SoTiet: monHoc.SoTiet,
      MoTa: monHoc.MoTa || '',
    });
    setIsEditing(true);
    setEditId(monHoc.MonHocID);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa môn học này?')) {
      try {
        await api.delete(`/mon-hoc/${id}`);
        alert('Xóa thành công!');
        fetchMonHocs();
      } catch (err) {
        console.error('Lỗi khi xóa môn học', err);
        alert('Lỗi khi xóa môn học');
      }
    }
  };

  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <h2 style={{ marginBottom: '20px', color: '#1a365d' }}>Quản Trị: Quản Lý Môn Học</h2>

      <div style={{ display: 'flex', gap: '30px' }}>
        <div style={{ flex: '1', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
          <h3>{isEditing ? 'Sửa môn học' : 'Thêm môn học mới'}</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
            <div>
              <label>Tên môn học</label>
              <input
                type="text"
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                value={formData.TenMonHoc}
                onChange={e => setFormData({ ...formData, TenMonHoc: e.target.value })}
              />
            </div>
            <div>
              <label>Số tiết</label>
              <input
                type="number"
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                value={formData.SoTiet}
                onChange={e => setFormData({ ...formData, SoTiet: e.target.value })}
              />
            </div>
            <div>
              <label>Mô tả</label>
              <input
                type="text"
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                value={formData.MoTa}
                onChange={e => setFormData({ ...formData, MoTa: e.target.value })}
              />
            </div>
            <button type="submit" className="primary-button" style={{ marginTop: '10px' }}>
              {isEditing ? 'Lưu thay đổi' : 'Thêm mới'}
            </button>
            {isEditing && (
              <button type="button" onClick={() => { setIsEditing(false); setFormData({ TenMonHoc: '', SoTiet: '', MoTa: '' }) }} style={{ marginTop: '5px', padding: '10px' }}>
                Hủy
              </button>
            )}
          </form>
        </div>

        <div style={{ flex: '2' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#2b6cb0', color: 'white' }}>
                <th style={{ padding: '12px', border: '1px solid #ddd' }}>ID</th>
                <th style={{ padding: '12px', border: '1px solid #ddd' }}>Tên môn</th>
                <th style={{ padding: '12px', border: '1px solid #ddd' }}>Số tiết</th>
                <th style={{ padding: '12px', border: '1px solid #ddd' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {monHocs.map(mon => (
                <tr key={mon.MonHocID}>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>{mon.MonHocID}</td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>{mon.TenMonHoc}</td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>{mon.SoTiet}</td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                    <button onClick={() => handleEdit(mon)} style={{ marginRight: '10px', color: 'blue', cursor: 'pointer' }}>Sửa</button>
                    <button onClick={() => handleDelete(mon.MonHocID)} style={{ color: 'red', cursor: 'pointer' }}>Xóa</button>
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
