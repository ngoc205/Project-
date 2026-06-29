import React, { useEffect, useState } from 'react';
import api from '../../api/axiosClient'; // Import instance axios của bạn
import './ChiTietHocSinh.css'; 

const ChiTietHocSinh = ({ hocSinhId, onNavigate }) => {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    // Gọi API đã tạo ở Backend
    api.get(`/api/giaovien/hocsinh/detail/${hocSinhId}`)
      .then(res => setInfo(res.data))
      .catch(err => console.error("Lỗi lấy chi tiết:", err));
  }, [hocSinhId]);

  if (!info) return <div className="page-container">Đang tải dữ liệu...</div>;

  return (
    <div className="page-container">
      <h3>Thông tin học sinh</h3>
      <div className="info-content">
        <p><strong>Họ và tên:</strong> {info.TenHocSinh}</p>
        <p><strong>Ngày sinh:</strong> {new Date(info.NgaySinh).toLocaleDateString()}</p>
        <p><strong>Giới tính:</strong> {info.GioiTinh}</p>
        <p><strong>Quê quán:</strong> {info.DiaChi}</p>
        <hr />
        <p><strong>Nhận xét từ giáo viên (Học bạ):</strong></p>
        <p className="nhan-xet-box">{info.NhanXet || 'Chưa có nhận xét'}</p>
        <p><strong>Trạng thái lên lớp:</strong> {info.DoLenLop ? 'Đạt' : 'Chưa đạt'}</p>
      </div>
      <button className="btn-detail" onClick={() => onNavigate('lop-chu-nhiem')}>
        Quay lại danh sách
      </button>
    </div>
  );
};

export default ChiTietHocSinh;