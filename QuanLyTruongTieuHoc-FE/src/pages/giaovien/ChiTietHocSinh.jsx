import React, { useEffect, useState } from 'react';
import api from '../../api/axiosClient'; // Import instance axios của bạn
import './ChiTietHocSinh.css'; 

const ChiTietHocSinh = ({ hocSinhId, onNavigate }) => {
  const [info, setInfo] = useState(null);

  const formatScore = (score) => (
    score === null || score === undefined || score === '' ? '-' : Number(score).toFixed(1)
  );

  useEffect(() => {
    // Gọi API đã tạo ở Backend
    api.get(`/api/giaovien/hocsinh/detail/${hocSinhId}`)
      .then(res => setInfo(res.data))
      .catch(err => console.error("Lỗi lấy chi tiết:", err));
  }, [hocSinhId]);

  if (!info) return <div className="page-container">Đang tải dữ liệu...</div>;

  const tongKet = info.tongKet || {};
  const tongMon = Number(tongKet.TongMon || 0);
  const tongMonDaCoDiem = Number(tongKet.TongMonDaCoDiem || 0);
  const diemTrungBinhChung = Number(tongKet.DiemTrungBinhChung || 0);
  const daNhapDuDiem = tongMon > 0 && tongMonDaCoDiem === tongMon;
  const duDieuKienLenLop = daNhapDuDiem && diemTrungBinhChung >= 5;
  const lyDoChuaDat = !daNhapDuDiem
    ? 'Chưa nhập đủ điểm tất cả các môn'
    : diemTrungBinhChung < 5
      ? 'Điểm tổng kết dưới 5'
      : '';

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
        <p><strong>Trạng thái lên lớp:</strong> {duDieuKienLenLop ? 'Đạt' : 'Chưa đạt'}</p>
      </div>

      <section className="score-section">
        <div className="score-heading">
          <h3>Bảng điểm</h3>
          <div className={duDieuKienLenLop ? 'summary-badge pass' : 'summary-badge warning'}>
            {tongKet.DiemTrungBinhChung !== null && tongKet.DiemTrungBinhChung !== undefined
              ? `Tổng kết: ${Number(tongKet.DiemTrungBinhChung).toFixed(2)}`
              : 'Chưa có điểm tổng kết'}
          </div>
        </div>

        <table className="score-table">
          <thead>
            <tr>
              <th>Môn học</th>
              <th>Hệ số 1</th>
              <th>Hệ số 2</th>
              <th>Hệ số 3</th>
              <th>TB môn</th>
            </tr>
          </thead>
          <tbody>
            {(info.bangDiem || []).map((mon) => (
              <tr key={mon.MonHocID}>
                <td>{mon.TenMonHoc}</td>
                <td>{formatScore(mon.DiemMieng)}</td>
                <td>{formatScore(mon.DiemGiuaKy)}</td>
                <td>{formatScore(mon.DiemCuoiKy)}</td>
                <td className="subject-average">{formatScore(mon.DiemTrungBinh)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="score-summary">
          <span>Số môn đã có đủ điểm: <strong>{tongMonDaCoDiem}/{tongMon}</strong></span>
          <span>Điều kiện lên lớp: <strong>{duDieuKienLenLop ? 'Đạt' : 'Chưa đạt'}</strong></span>
          {!duDieuKienLenLop && lyDoChuaDat && <span>Lý do: <strong>{lyDoChuaDat}</strong></span>}
        </div>
      </section>

      <button className="btn-detail" onClick={() => onNavigate('lop-chu-nhiem')}>
        Quay lại danh sách
      </button>
    </div>
  );
};

export default ChiTietHocSinh;
