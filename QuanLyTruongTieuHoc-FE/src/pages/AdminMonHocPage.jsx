import { useState, useEffect } from 'react';
import api from '../api/axiosClient';
import Swal from 'sweetalert2'; // Thêm import SweetAlert2

export default function AdminMonHocPage() {
  const [monHocs, setMonHocs] = useState([]);
  const [formData, setFormData] = useState({
    TenMonHoc: '',
    SoTiet: '',
    MoTa: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // --- CÁC STATE MỚI CHO TÌM KIẾM VÀ PHÂN TRANG ---
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Số lượng môn học trên 1 trang

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
        // Thay alert bằng Modal
        Swal.fire({
          icon: 'success',
          title: 'Cập nhật thành công!',
          showConfirmButton: false,
          timer: 1500
        });
      } else {
        await api.post('/mon-hoc', payload);
        // Thay alert bằng Modal
        Swal.fire({
          icon: 'success',
          title: 'Thêm mới thành công!',
          showConfirmButton: false,
          timer: 1500
        });
      }

      setFormData({ TenMonHoc: '', SoTiet: '', MoTa: '' });
      setIsEditing(false);
      setEditId(null);
      fetchMonHocs();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Có lỗi xảy ra',
        text: err.response?.data?.message || err.message,
      });
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
    // Thay window.confirm bằng Modal xác nhận của SweetAlert2
    Swal.fire({
      title: 'Bạn có chắc muốn xóa?',
      text: "Dữ liệu sau khi xóa sẽ không thể khôi phục!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Đồng ý xóa',
      cancelButtonText: 'Hủy'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/mon-hoc/${id}`);
          // Thay alert xóa thành công bằng Modal
          Swal.fire({
            icon: 'success',
            title: 'Xóa thành công!',
            showConfirmButton: false,
            timer: 1500
          });
          fetchMonHocs();
        } catch (err) {
          console.error('Lỗi khi xóa môn học', err);
          Swal.fire({
            icon: 'error',
            title: 'Lỗi!',
            text: 'Không thể xóa môn học này.',
          });
        }
      }
    });
  };

  // --- LOGIC TÌM KIẾM VÀ PHÂN TRANG ---
  // 1. Lọc danh sách theo tên môn học
  const filteredMonHocs = monHocs.filter((mon) =>
    mon.TenMonHoc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 2. Tính toán các item cho trang hiện tại
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMonHocs.slice(indexOfFirstItem, indexOfLastItem);

  // 3. Tính tổng số trang
  const totalPages = Math.ceil(filteredMonHocs.length / itemsPerPage);

  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <h2 style={{ marginBottom: '20px', color: '#1a365d' }}>Quản Trị: Quản Lý Môn Học</h2>

      <div style={{ display: 'flex', gap: '30px' }}>
        {/* CỘT BÊN TRÁI: FORM THÊM/SỬA */}
        <div style={{ flex: '1', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '8px', height: 'fit-content' }}>
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
            
            {/* Thu nhỏ nút Lưu thay đổi / Thêm mới */}
            <button 
              type="submit" 
              className="primary-button" 
              style={{ marginTop: '10px', padding: '6px 12px', fontSize: '14px', width: 'fit-content' }}
            >
              {isEditing ? 'Lưu thay đổi' : 'Thêm mới'}
            </button>
            
            {isEditing && (
              <button 
                type="button" 
                onClick={() => { setIsEditing(false); setFormData({ TenMonHoc: '', SoTiet: '', MoTa: '' }) }} 
                style={{ marginTop: '5px', padding: '6px 12px', fontSize: '14px', width: 'fit-content' }}
              >
                Hủy
              </button>
            )}
          </form>
        </div>

        {/* CỘT BÊN PHẢI: TÌM KIẾM & BẢNG DANH SÁCH */}
        <div style={{ flex: '2' }}>
          
          {/* Ô Tìm kiếm */}
          <div style={{ marginBottom: '15px' }}>
            <input
              type="text"
              placeholder="🔍 Tìm kiếm theo tên môn học..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Trở về trang 1 khi tìm kiếm
              }}
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
            />
          </div>

          {/* Bảng dữ liệu */}
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#2b6cb0', color: 'white' }}>
                <th style={{ padding: '12px', border: '1px solid #ddd' }}>ID</th>
                <th style={{ padding: '12px', border: '1px solid #ddd' }}>Tên môn</th>
                {/* Căn giữa cột Số tiết */}
                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>Số tiết</th>
                <th style={{ padding: '12px', border: '1px solid #ddd' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? currentItems.map(mon => (
                <tr key={mon.MonHocID}>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>{mon.MonHocID}</td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>{mon.TenMonHoc}</td>
                  {/* Căn giữa dữ liệu Số tiết */}
                  <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>{mon.SoTiet}</td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                    <button onClick={() => handleEdit(mon)} style={{ marginRight: '10px', color: 'blue', cursor: 'pointer', background: 'none', border: 'none' }}>Sửa</button>
                    <button onClick={() => handleDelete(mon.MonHocID)} style={{ color: 'red', cursor: 'pointer', background: 'none', border: 'none' }}>Xóa</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>Không tìm thấy môn học nào.</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Giao diện Phân trang */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', gap: '15px' }}>
              <button 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage(currentPage - 1)}
                style={{ padding: '5px 15px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
              >
                Trước
              </button>
              
              <span style={{ fontWeight: 'bold' }}>
                Trang {currentPage} / {totalPages}
              </span>
              
              <button 
                disabled={currentPage === totalPages} 
                onClick={() => setCurrentPage(currentPage + 1)}
                style={{ padding: '5px 15px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
              >
                Sau
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}