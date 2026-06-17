import { useEffect, useState } from 'react';
import SectionTitle from '../components/SectionTitle';

export default function TeacherDashboardPage() {
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUserInfo(JSON.parse(savedUser));
    }
  }, []);

  return (
    <div className="container" style={{ padding: '40px 0', minHeight: '60vh' }}>
      <SectionTitle 
        title={`Xin chào Giáo viên: ${userInfo?.TenDangNhap || ''}`} 
        subtitle="Bảng điều khiển cá nhân" 
      />
      <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#ebf8ff', borderRadius: '8px' }}>
        <h3>Lịch dạy / Thời khóa biểu của bạn tuần này</h3>
        <p style={{ marginTop: '10px' }}>
          <em>Tính năng tải thời khóa biểu theo ID giáo viên đang được phát triển...</em>
        </p>
      </div>
    </div>
  );
}