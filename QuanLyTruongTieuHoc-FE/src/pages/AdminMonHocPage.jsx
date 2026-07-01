import { useState, useEffect } from 'react';
import api from '../api/axiosClient';
import Swal from 'sweetalert2';

export default function AdminMonHocPage() {
  const [monHocs, setMonHocs] = useState([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
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
        Swal.fire({
  icon: 'success',
  title: 'Thành công',
  text: 'Cập nhật môn học thành công!',
  timer: 1500,
  showConfirmButton: false,
});
      } else {
        await api.post('/mon-hoc', payload);
        Swal.fire({
  icon: 'success',
  title: 'Thành công',
  text: 'Thêm môn học thành công!',
  timer: 1500,
  showConfirmButton: false,
});
      }

      setFormData({ TenMonHoc: '', SoTiet: '', MoTa: '' });
      setIsEditing(false);
      setEditId(null);
      fetchMonHocs();
    } catch (err) {
      Swal.fire({
  icon: 'error',
  title: 'Lỗi',
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
  const result = await Swal.fire({
    title: 'Bạn có chắc?',
    text: 'Bạn sẽ không thể hoàn tác thao tác này!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Xóa',
    cancelButtonText: 'Hủy',
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
  });

  if (result.isConfirmed) {
    try {
      await api.delete(`/mon-hoc/${id}`);

      Swal.fire({
        icon: 'success',
        title: 'Đã xóa!',
        text: 'Xóa môn học thành công!',
        timer: 1500,
        showConfirmButton: false,
      });

      fetchMonHocs();
    } catch (err) {
      console.error(err);

      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Lỗi khi xóa môn học',
      });
    }
  }
};

  const filteredMonHocs = monHocs.filter(mon =>
    mon.TenMonHoc.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredMonHocs.length / itemsPerPage);

  const currentMonHocs = filteredMonHocs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <h2 style={{ marginBottom: '20px', color: '#1a365d' }}>
        Quản Trị: Quản Lý Môn Học
      </h2>

      <div style={{ display: 'flex', gap: '30px' }}>
        <div
          style={{
            flex: '1',
            padding: '20px',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
          }}
        >
          <h3>{isEditing ? 'Sửa môn học' : 'Thêm môn học mới'}</h3>

          <form
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
              marginTop: '15px',
            }}
          >
            <div>
              <label>Tên môn học</label>
              <input
                type="text"
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                value={formData.TenMonHoc}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    TenMonHoc: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label>Số tiết</label>
              <input
                type="number"
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                value={formData.SoTiet}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    SoTiet: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label>Mô tả</label>
              <input
                type="text"
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                value={formData.MoTa}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    MoTa: e.target.value,
                  })
                }
              />
            </div>

            <button
              type="submit"
              className="primary-button"
              style={{ marginTop: '10px' }}
            >
              {isEditing ? 'Lưu thay đổi' : 'Thêm mới'}
            </button>

            {isEditing && (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditId(null);
                  setFormData({
                    TenMonHoc: '',
                    SoTiet: '',
                    MoTa: '',
                  });
                }}
                style={{ marginTop: '5px', padding: '10px' }}
              >
                Hủy
              </button>
            )}
          </form>
        </div>

        <div style={{ flex: '2' }}>
          <div style={{ marginBottom: '15px' }}>
            <input
              type="text"
              placeholder="🔍 Tìm kiếm theo tên môn học..."
              value={search}
              onChange={(e)=>{setSearch(e.target.value);setCurrentPage(1);}}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '6px',
                fontSize: '15px',
              }}
            />
          </div>

          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#2b6cb0', color: 'white' }}>
                <th style={{ padding: '12px', border: '1px solid #ddd' }}>ID</th>
                <th style={{ padding: '12px', border: '1px solid #ddd' }}>
                  Tên môn
                </th>
                <th style={{ padding: '12px', border: '1px solid #ddd' }}>
                  Số tiết
                </th>
                <th style={{ padding: '12px', border: '1px solid #ddd' }}>
                  Hành động
                </th>
              </tr>
            </thead>

            <tbody>
              {currentMonHocs.map((mon) => (
                <tr key={mon.MonHocID}>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                    {mon.MonHocID}
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                    {mon.TenMonHoc}
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                    {mon.SoTiet}
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                    <button
                      onClick={() => handleEdit(mon)}
                      style={{
                        marginRight: '10px',
                        color: 'blue',
                        cursor: 'pointer',
                      }}
                    >
                      Sửa
                    </button>

                    <button
                      onClick={() => handleDelete(mon.MonHocID)}
                      style={{
                        color: 'red',
                        cursor: 'pointer',
                      }}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}

              {filteredMonHocs.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    style={{
                      textAlign: 'center',
                      padding: '20px',
                      color: '#666',
                    }}
                  >
                    Không tìm thấy môn học.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div style={{display:'flex',justifyContent:'center',gap:'8px',marginTop:'20px'}}>
            <button disabled={currentPage===1} onClick={()=>setCurrentPage(currentPage-1)}>◀</button>
            {Array.from({length: totalPages}, (_,index)=>(
              <button key={index} onClick={()=>setCurrentPage(index+1)}
              style={{padding:'8px 12px',background:currentPage===index+1?'#2b6cb0':'#fff',color:currentPage===index+1?'#fff':'#000'}}>
                {index+1}
              </button>
            ))}
            <button disabled={currentPage===totalPages||totalPages===0} onClick={()=>setCurrentPage(currentPage+1)}>▶</button>
          </div>

        </div>
      </div>
    </div>
  );
}