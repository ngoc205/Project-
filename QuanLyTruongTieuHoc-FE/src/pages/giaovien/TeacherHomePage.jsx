import { useState, useEffect } from 'react';
import api from '../../api/axiosClient';
import './TeacherHomePage.css';

const TeacherHomePage = ({ teacherId }) => {
  const [lichDay, setLichDay] = useState([]);
  const [lopChuNhiem, setLopChuNhiem] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. KHAI BÁO CÁC BIẾN CẦN THIẾT ĐỂ RENDER
  const days = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu'];
  const periods = [1, 2, 3, 4, 5, 6, 7, 8];

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const [lichDayRes, lopRes] = await Promise.all([
          api.get(`/api/giaovien/${teacherId}/lich-day`),
          api.get(`/api/giaovien/${teacherId}/lop-chu-nhiem`)
        ]);

        setLichDay(lichDayRes.data);
        
        if (lopRes.data && lopRes.data.success) {
          setLopChuNhiem(lopRes.data.lopChuNhiem);
        } else {
          setLopChuNhiem(null);
        }
      } catch (error) {
        console.error('Lỗi lấy dữ liệu:', error);
      } finally {
        setLoading(false);
      }
    };

    if (teacherId) fetchTeacherData();
  }, [teacherId]);

  if (loading) return <div>Đang tải dữ liệu...</div>;

  return (
    <div className="teacher-home-container">
      <div className="welcome-banner">
        <h2>Xin chào Thầy/Cô!</h2>
        {lopChuNhiem ? (
          <p>Giáo viên chủ nhiệm lớp: <strong>{lopChuNhiem.tenLop}</strong> (Sĩ số: {lopChuNhiem.siSo})</p>
        ) : (
          <p>Hiện tại chưa phân công chủ nhiệm.</p>
        )}
      </div>

      {/* ĐÃ SỬA: XÓA THẺ ĐÓNG DIV DƯ THỪA Ở ĐÂY */}

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
