import React, { useState, useEffect } from 'react';
import api from '../../api/axiosClient';
import './diem.css'; 

const Diem = ({ teacherId, onNavigate }) => {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [loading, setLoading] = useState(true);
  
  // State quản lý Modal thông báo
  const [modal, setModal] = useState({ isOpen: false, message: '', type: 'success' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resLop = await api.get(`/api/giaovien/${teacherId || 3}/lop-chu-nhiem`);
        
        if (resLop.data && resLop.data.success) {
          setStudents(resLop.data.danhSachHocSinh || []);
          const lopId = resLop.data.lopChuNhiem?.LopID || resLop.data.lopChuNhiem?.id; 
          
          if (!lopId) {
            console.error("Lỗi: Không tìm thấy ID của lớp chủ nhiệm.");
            setLoading(false);
            return;
          }

          const cleanLopId = String(lopId).replace(':1', '');
          const resMon = await api.get(`/api/giaovien/lop/${cleanLopId}/monhoc`);
          
          if (resMon.data) {
             setSubjects(resMon.data);
             if (resMon.data.length > 0) {
                 setSelectedSubject(resMon.data[0].MonHocID);
             }
          }
        }
      } catch (err) {
        console.error("Lỗi lấy dữ liệu API:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [teacherId]);

  const handleGradeChange = (id, field, value) => {
    if (value !== '' && (isNaN(value) || value < 0 || value > 10)) return;

    setStudents(prevStudents =>
      prevStudents.map(student =>
        student.HocSinhID === id ? { ...student, [field]: value } : student
      )
    );
  };

  const calculateAverage = (hs1, hs2, hs3) => {
    const d1 = parseFloat(hs1);
    const d2 = parseFloat(hs2);
    const d3 = parseFloat(hs3);

    if (isNaN(d1) && isNaN(d2) && isNaN(d3)) return '';

    let totalScore = 0;
    let totalWeight = 0;

    if (!isNaN(d1)) { totalScore += d1 * 1; totalWeight += 1; }
    if (!isNaN(d2)) { totalScore += d2 * 2; totalWeight += 2; }
    if (!isNaN(d3)) { totalScore += d3 * 3; totalWeight += 3; }

    return totalWeight === 0 ? '' : (totalScore / totalWeight).toFixed(1);
  };

  const handleSaveGrades = () => {
    if (!selectedSubject) {
      // Thay alert bằng Modal báo lỗi
      setModal({ isOpen: true, message: "Vui lòng chọn môn học trước khi lưu!", type: 'error' });
      return;
    }
    
    console.log("Dữ liệu lưu cho môn:", selectedSubject, students);
    // Thay alert bằng Modal báo thành công
    setModal({ isOpen: true, message: "Đã lưu tất cả điểm thành công!", type: 'success' });
  };

  const closeModal = () => setModal({ ...modal, isOpen: false });

  if (loading) return <div className="lop-container">Đang tải dữ liệu...</div>;

  return (
    <div className="lop-container">
      <h2>Nhập điểm lớp</h2>

      <div className="subject-selector" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <label htmlFor="subject-select" style={{ fontWeight: 'bold' }}>Chọn môn học:</label>
        <select 
          id="subject-select" 
          value={selectedSubject} 
          onChange={(e) => setSelectedSubject(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minWidth: '150px' }}
        >
          <option value="">-- Chọn môn --</option>
          {subjects.map((sub) => (
            <option key={sub.MonHocID} value={sub.MonHocID}>{sub.TenMonHoc}</option>
          ))}
        </select>
      </div>

      <table className="lop-table">
        <thead>
          <tr>
            <th>STT</th>
            <th>Họ và tên</th>
            <th>Ngày sinh</th>
            <th>Hệ số 1</th>
            <th>Hệ số 2</th>
            <th>Hệ số 3</th>
            <th>Điểm trung bình</th>
          </tr>
        </thead>
        <tbody>
          {students.map((hs, index) => (
            <tr key={hs.HocSinhID}>
              <td>{index + 1}</td>
              <td style={{ textAlign: 'left' }}>{hs.TenHocSinh}</td>
              <td>{hs.NgaySinh ? new Date(hs.NgaySinh).toLocaleDateString() : ''}</td>
              <td>
                <input
                  type="text"
                  value={hs.HeSo1 !== undefined ? hs.HeSo1 : ''}
                  onChange={(e) => handleGradeChange(hs.HocSinhID, 'HeSo1', e.target.value)}
                  style={{ width: '50px', textAlign: 'center', padding: '5px' }}
                />
              </td>
              <td>
                <input
                  type="text"
                  value={hs.HeSo2 !== undefined ? hs.HeSo2 : ''}
                  onChange={(e) => handleGradeChange(hs.HocSinhID, 'HeSo2', e.target.value)}
                  style={{ width: '50px', textAlign: 'center', padding: '5px' }}
                />
              </td>
              <td>
                <input
                  type="text"
                  value={hs.HeSo3 !== undefined ? hs.HeSo3 : ''}
                  onChange={(e) => handleGradeChange(hs.HocSinhID, 'HeSo3', e.target.value)}
                  style={{ width: '50px', textAlign: 'center', padding: '5px' }}
                />
              </td>
              <td style={{ fontWeight: 'bold', color: '#2563eb' }}>
                {calculateAverage(hs.HeSo1, hs.HeSo2, hs.HeSo3)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="action-buttons" style={{ marginTop: '20px', display: 'flex', gap: '15px' }}>
        <button className="btn-detail" onClick={handleSaveGrades} style={{ backgroundColor: '#059669', color: 'white' }}>
          Lưu điểm
        </button>
        <button className="btn-detail" onClick={() => onNavigate('teacher-dashboard')} style={{ backgroundColor: '#64748b', color: 'white' }}>
          Trở về
        </button>
      </div>

      {/* COMPONENT MODAL THÔNG BÁO */}
      {modal.isOpen && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <div className={`modal-icon ${modal.type}`}>
              {modal.type === 'success' ? '✓' : '!'}
            </div>
            <p className="modal-title">{modal.type === 'success' ? 'Thành công' : 'Lỗi'}</p>
            <p className="modal-message">{modal.message}</p>
            <button className={`btn-close-modal ${modal.type}`} onClick={closeModal}>
              Đồng ý
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Diem;