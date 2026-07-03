import { useEffect, useState } from 'react';
import { getLopChuNhiem } from '../../api/giaovienApi';
import './LopChuNhiem.css';

const LopChuNhiem = ({ teacherId, onNavigate }) => { // Thêm prop onNavigate
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError('');
    getLopChuNhiem(teacherId || 3)
      .then(res => {
        if (res.data && res.data.success) {
          setData(res.data);
        } else {
          setData(null);
          setError(res.data?.message || 'Không tìm thấy dữ liệu lớp học!');
        }
      })
      .catch(err => {
        console.error('Lỗi lấy lớp chủ nhiệm:', err);
        setData(null);
        setError(err.response?.data?.message || 'Không tải được dữ liệu lớp chủ nhiệm từ database.');
      })
      .finally(() => setLoading(false));
  }, [teacherId]);

  if (loading) return <div className="lop-container">Đang tải...</div>;
  if (!data) return <div className="lop-container">{error || 'Không tìm thấy dữ liệu lớp học!'}</div>;

  return (
    <div className="lop-container">
      <h2>Danh sách học sinh - {data.lopChuNhiem.tenLop}</h2>
      <table className="lop-table">
        <thead>
          <tr><th>STT</th><th>Họ và tên</th><th>Ngày sinh</th><th>Chi tiết</th></tr>
        </thead>
        <tbody>
          {data.danhSachHocSinh.map((hs, index) => (
            <tr key={hs.HocSinhID}>
              <td>{index + 1}</td>
              <td>{hs.TenHocSinh}</td>
              <td>{new Date(hs.NgaySinh).toLocaleDateString()}</td>
              <td>
                {/* Thay vì dùng Modal, ta điều hướng sang trang chi tiết */}
                <button 
                  className="btn-detail" 
                  onClick={() => onNavigate('chi-tiet-hs', hs.HocSinhID)}
                >
                  Chi tiết
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LopChuNhiem;
