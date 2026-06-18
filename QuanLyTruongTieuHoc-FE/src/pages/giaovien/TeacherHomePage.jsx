import React, { useState, useEffect } from 'react';
import api from '../../api/axiosClient';
import './TeacherHomePage.css';

const TeacherHomePage = ({ teacherId, onLogout }) => {
  const [lichDay, setLichDay] = useState([]);
  const [lopChuNhiem, setLopChuNhiem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Gọi API lấy lịch dạy và thông tin lớp chủ nhiệm cùng lúc
    const fetchTeacherData = async () => {
      try {
        const [lichDayResponse, lopChuNhiemResponse] = await Promise.all([
          api.get(`/api/giaovien/${teacherId}/lich-day`),
          api.get(`/api/giaovien/${teacherId}/lop-chu-nhiem`)
        ]);

        // Cập nhật state với dữ liệu mảng
        setLichDay(lichDayResponse.data);
        setLopChuNhiem(lopChuNhiemResponse.data);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu giáo viên:', error);
      } finally {
        setLoading(false);
      }
    };

    if (teacherId) {
      fetchTeacherData();
    }
  }, [teacherId]);

  if (loading) {
    return <div className="loading-spinner">Đang tải dữ liệu thời khóa biểu...</div>;
  }

  // ĐÃ CẬP NHẬT: Tên cột hiển thị khớp 100% với cột TenThu trong SQL Server
  const days = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu'];
  const periods = [1, 2, 3, 4, 5]; 

  return (
    <div className="teacher-home-container">
      {/* Khu vực thông báo và thông tin lớp chủ nhiệm */}
      <div className="welcome-banner">
        <div className="banner-content">
          <h2>Xin chào Thầy/Cô!</h2>
          {lopChuNhiem ? (
            <p>Giáo viên chủ nhiệm lớp: <span className="highlight-text">{lopChuNhiem.tenLop}</span> (Sĩ số: {lopChuNhiem.siSo})</p>
          ) : (
            <p>Hiện tại chưa phân công chủ nhiệm.</p>
          )}
        </div>
      </div>

      {/* Khu vực hiển thị bảng Lịch dạy - Gắn style inline cực mạnh để chống vỡ khung do CSS của App.css */}
      <div className="timetable-section" style={{ display: 'block', width: '100%' }}>
        <h3 className="timetable-title">LỊCH GIẢNG DẠY TRONG TUẦN</h3>
        <div className="table-responsive" style={{ overflowX: 'auto' }}>
          <table className="timetable" style={{ display: 'table', width: '100%', minWidth: '800px' }}>
            <thead>
              <tr style={{ display: 'table-row' }}>
                <th className="period-col" style={{ display: 'table-cell' }}>Tiết \ Ngày</th>
                {days.map(day => (
                  <th key={day} style={{ display: 'table-cell' }}>{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {periods.map(period => (
                <tr key={period} style={{ display: 'table-row' }}>
                  <td className="period-cell" style={{ display: 'table-cell' }}>Tiết {period}</td>
                  {days.map(day => {
                    // Xử lý thông minh: Chuyển hết về chữ thường và xóa khoảng trắng thừa để so khớp tuyệt đối
                    const lesson = Array.isArray(lichDay) 
                      ? lichDay.find(l => 
                          String(l.thu).trim().toLowerCase() === day.trim().toLowerCase() && 
                          Number(l.tiet) === period
                        ) 
                      : null;
                      
                    return (
                      <td key={`${day}-${period}`} className={lesson ? 'has-lesson' : 'empty-lesson'} style={{ display: 'table-cell' }}>
                        {lesson ? (
                          <div className="lesson-info">
                            <span className="subject-name">{lesson.tenMonHoc}</span>
                            <span className="class-name">Lớp: {lesson.tenLop}</span>
                            {lesson.phongHoc && <span className="room-name">Phòng: {lesson.phongHoc}</span>}
                          </div>
                        ) : (
                          <span className="empty-dash">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeacherHomePage;
