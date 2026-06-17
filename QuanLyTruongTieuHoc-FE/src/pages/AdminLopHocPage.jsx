import { useEffect, useMemo, useState } from 'react';
import api from '../api/axiosClient';

const emptyForm = {
  TenLop: '',
  KhoiID: 1,
  GiaoVienID: '',
  HocSinhIDs: [],
};

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  border: '1px solid #cbd5e1',
  borderRadius: '8px',
  marginTop: '7px',
  fontSize: '15px',
  backgroundColor: 'white',
  boxSizing: 'border-box',
};

const buttonPrimary = {
  padding: '12px 18px',
  borderRadius: '8px',
  border: 'none',
  backgroundColor: '#1f5aa6',
  color: 'white',
  fontWeight: 700,
  cursor: 'pointer',
};

const buttonGhost = {
  padding: '11px 16px',
  borderRadius: '8px',
  border: '1px solid #2b6cb0',
  color: '#2b6cb0',
  backgroundColor: 'white',
  fontWeight: 700,
  cursor: 'pointer',
};

const thStyle = {
  padding: '13px 14px',
  borderBottom: '1px solid #dbe3ef',
  textAlign: 'left',
  color: '#1a365d',
  backgroundColor: '#eef5ff',
};

const tdStyle = {
  padding: '13px 14px',
  borderBottom: '1px solid #edf2f7',
  verticalAlign: 'top',
};

function formatDate(dateValue) {
  if (!dateValue) return '-';
  return new Date(dateValue).toLocaleDateString('vi-VN');
}

export default function AdminLopHocPage() {
  const [classes, setClasses] = useState([]);
  const [options, setOptions] = useState({ khoi: [], giaoVien: [], hocSinh: [], canAssignStudents: false });
  const [form, setForm] = useState(emptyForm);
  const [selectedClass, setSelectedClass] = useState(null);
  const [screen, setScreen] = useState('list');
  const [studentSearch, setStudentSearch] = useState('');
  const [teacherSearch, setTeacherSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const allStudents = useMemo(() => {
    const map = new Map();
    [...options.hocSinh, ...(selectedClass?.hocSinh || [])].forEach((student) => {
      map.set(Number(student.HocSinhID), student);
    });
    return [...map.values()];
  }, [options.hocSinh, selectedClass]);

  const selectedStudents = useMemo(() => {
    const ids = new Set(form.HocSinhIDs.map(Number));
    return allStudents.filter((student) => ids.has(Number(student.HocSinhID)));
  }, [form.HocSinhIDs, allStudents]);

  const filteredStudents = useMemo(() => {
    const keyword = studentSearch.trim().toLowerCase();
    if (!keyword) return [];

    return allStudents
      .filter((student) => `${student.HocSinhID} ${student.TenHocSinh} ${student.TenLop || ''}`.toLowerCase().includes(keyword))
      .slice(0, 8);
  }, [studentSearch, allStudents]);

  const filteredTeachers = useMemo(() => {
    const keyword = teacherSearch.trim().toLowerCase();
    if (!keyword) return [];
    return options.giaoVien
      .filter((teacher) => `${teacher.GiaoVienID} ${teacher.HoTen} ${teacher.SoDienThoai || ''}`.toLowerCase().includes(keyword))
      .slice(0, 8);
  }, [teacherSearch, options.giaoVien]);

  const loadData = async () => {
    const [classRes, optionRes] = await Promise.all([
      api.get('/lop-hoc'),
      api.get('/lop-hoc/options'),
    ]);
    setClasses(classRes.data);
    setOptions(optionRes.data);
  };

  useEffect(() => {
    loadData().catch((err) => {
      console.error('Lỗi tải dữ liệu lớp học', err);
      alert('Không tải được dữ liệu lớp học. Kiểm tra backend /lop-hoc.');
    });
  }, []);

  const startCreate = () => {
    setSelectedClass(null);
    setForm(emptyForm);
    setTeacherSearch('');
    setStudentSearch('');
    setScreen('form');
  };

  const startEdit = (detail = selectedClass) => {
    if (!detail) return;
    setSelectedClass(detail);
    setForm({
      TenLop: detail.TenLop || '',
      KhoiID: detail.KhoiID || 1,
      GiaoVienID: detail.GiaoVienID || '',
      HocSinhIDs: (detail.hocSinh || []).map((student) => Number(student.HocSinhID)),
    });
    setTeacherSearch(detail.TenGiaoVien ? `${detail.GiaoVienID} - ${detail.TenGiaoVien}` : '');
    setStudentSearch('');
    setScreen('form');
  };

  const openDetail = async (lop) => {
    try {
      const res = await api.get(`/lop-hoc/${lop.LopID}`);
      setSelectedClass(res.data);
      setScreen('detail');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      alert(err.response?.data?.message || 'Không xem được chi tiết lớp!');
    }
  };

  const chooseTeacher = (teacher) => {
    setForm((prev) => ({ ...prev, GiaoVienID: teacher.GiaoVienID }));
    setTeacherSearch(`${teacher.GiaoVienID} - ${teacher.HoTen}`);
  };

  const addStudent = (student) => {
    const studentId = Number(student.HocSinhID);
    setForm((prev) => ({
      ...prev,
      HocSinhIDs: prev.HocSinhIDs.includes(studentId) ? prev.HocSinhIDs : [...prev.HocSinhIDs, studentId],
    }));
    setStudentSearch('');
  };

  const removeStudent = (id) => {
    const studentId = Number(id);
    setForm((prev) => ({
      ...prev,
      HocSinhIDs: prev.HocSinhIDs.filter((selectedId) => selectedId !== studentId),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const tenLop = form.TenLop.trim();
    if (!tenLop) return alert('Vui lòng nhập tên lớp!');
    if (!form.KhoiID) return alert('Vui lòng chọn khối học!');
    if (!form.GiaoVienID) return alert('Vui lòng chọn giáo viên từ danh sách gợi ý!');

    setLoading(true);
    try {
      const payload = {
        TenLop: tenLop,
        KhoiID: Number(form.KhoiID),
        GiaoVienID: Number(form.GiaoVienID),
        HocSinhIDs: form.HocSinhIDs,
      };

      const res = selectedClass
        ? await api.put(`/lop-hoc/${selectedClass.LopID}`, payload)
        : await api.post('/lop-hoc', payload);

      alert(selectedClass ? 'Cập nhật lớp thành công!' : 'Tạo lớp thành công!');
      await loadData();
      setSelectedClass(res.data);
      setScreen('detail');
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi lưu lớp học!');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedClass) return;
    if (!window.confirm(`Bạn có chắc muốn xóa lớp ${selectedClass.TenLop}?`)) return;

    try {
      await api.delete(`/lop-hoc/${selectedClass.LopID}`);
      alert('Xóa lớp thành công!');
      setSelectedClass(null);
      setScreen('list');
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Không xóa được lớp học!');
    }
  };

  const header = (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', alignItems: 'flex-start', marginBottom: '22px' }}>
      <div>
        <h2 style={{ color: '#1a365d', margin: 0 }}>Quản lý Khối - Lớp</h2>
        <p style={{ color: '#64748b', marginTop: '8px' }}>Tạo lớp, sửa khối, phân công giáo viên chủ nhiệm và quản lý danh sách học sinh.</p>
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        {screen !== 'list' && <button type="button" onClick={() => setScreen('list')} style={buttonGhost}>Danh sách lớp</button>}
        <button type="button" onClick={startCreate} style={buttonPrimary}>Tạo lớp mới</button>
      </div>
    </div>
  );

  if (screen === 'detail' && selectedClass) {
    return (
      <div style={{ padding: '24px 0' }}>
        {header}
        <section style={{ border: '1px solid #dbe3ef', borderRadius: '10px', overflow: 'hidden', background: 'white' }}>
          <div style={{ padding: '18px 22px', background: '#eef5ff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ color: '#1a365d', margin: 0 }}>Chi tiết lớp {selectedClass.TenLop}</h3>
              <p style={{ margin: '6px 0 0', color: '#64748b' }}>{selectedClass.TenKhoi} - Giáo viên chủ nhiệm: {selectedClass.TenGiaoVien || 'Chưa phân công'}</p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={() => startEdit(selectedClass)} style={buttonPrimary}>Sửa lớp</button>
              <button type="button" onClick={handleDelete} style={{ ...buttonPrimary, backgroundColor: '#b91c1c' }}>Xóa lớp</button>
            </div>
          </div>

          <div style={{ padding: '22px', display: 'grid', gridTemplateColumns: '260px 260px 1fr', gap: '18px' }}>
            <InfoBox label="Mã lớp" value={selectedClass.LopID} />
            <InfoBox label="Khối học" value={selectedClass.TenKhoi || selectedClass.KhoiID} />
            <InfoBox label="Ngày tạo" value={formatDate(selectedClass.NgayTao)} />
          </div>

          <div style={{ padding: '0 22px 22px' }}>
            <h3 style={{ color: '#1a365d' }}>Danh sách học sinh ({selectedClass.hocSinh?.length || 0})</h3>
            <StudentTable students={selectedClass.hocSinh || []} />
          </div>
        </section>
      </div>
    );
  }

  if (screen === 'form') {
    return (
      <div style={{ padding: '24px 0' }}>
        {header}
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '24px', alignItems: 'start' }}>
          <section style={{ background: '#f8fafc', border: '1px solid #dbe3ef', borderRadius: '10px', padding: '20px' }}>
            <h3 style={{ color: '#1a365d', marginTop: 0 }}>{selectedClass ? 'Sửa thông tin lớp' : 'Tạo mới lớp'}</h3>

            <label style={{ display: 'block', marginBottom: '14px', fontWeight: 700, color: '#334155' }}>
              Khối học
              <select value={form.KhoiID} onChange={(e) => setForm({ ...form, KhoiID: Number(e.target.value) })} style={inputStyle} required>
                <option value="">Chọn khối</option>
                {options.khoi.map((khoi) => (
                  <option key={khoi.KhoiID} value={khoi.KhoiID}>{khoi.TenKhoi}</option>
                ))}
              </select>
            </label>

            <label style={{ display: 'block', marginBottom: '14px', fontWeight: 700, color: '#334155' }}>
              Tên lớp
              <input
                value={form.TenLop}
                onChange={(e) => setForm({ ...form, TenLop: e.target.value.toUpperCase() })}
                placeholder="Ví dụ: 1A, 2B, 5A1"
                maxLength={10}
                style={inputStyle}
                required
              />
            </label>

            <div style={{ position: 'relative', marginBottom: '14px' }}>
              <label style={{ display: 'block', fontWeight: 700, color: '#334155' }}>
                Giáo viên chủ nhiệm
                <input
                  value={teacherSearch}
                  onChange={(e) => {
                    setTeacherSearch(e.target.value);
                    setForm({ ...form, GiaoVienID: '' });
                  }}
                  placeholder="Nhập mã hoặc tên giáo viên"
                  style={inputStyle}
                  required
                />
              </label>
              {filteredTeachers.length > 0 && !form.GiaoVienID && (
                <div style={{ position: 'absolute', zIndex: 5, left: 0, right: 0, top: '78px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', boxShadow: '0 10px 24px rgba(15,23,42,0.14)', overflow: 'hidden' }}>
                  {filteredTeachers.map((teacher) => (
                    <button key={teacher.GiaoVienID} type="button" onClick={() => chooseTeacher(teacher)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '11px 13px', border: 'none', borderBottom: '1px solid #edf2f7', background: 'white', cursor: 'pointer' }}>
                      <strong>{teacher.GiaoVienID} - {teacher.HoTen}</strong><br />
                      <small>{teacher.SoDienThoai || 'Chưa có số điện thoại'}</small>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button type="submit" disabled={loading} style={{ ...buttonPrimary, flex: 1, opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Đang lưu...' : selectedClass ? 'Cập nhật lớp' : 'Xác nhận tạo lớp'}
              </button>
              <button type="button" onClick={() => selectedClass ? setScreen('detail') : setScreen('list')} style={buttonGhost}>Hủy</button>
            </div>
          </section>

          <section style={{ background: 'white', border: '1px solid #dbe3ef', borderRadius: '10px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start', marginBottom: '18px' }}>
              <div>
                <h3 style={{ color: '#1a365d', margin: 0 }}>Thêm học sinh</h3>
                <p style={{ color: '#64748b', margin: '6px 0 0' }}>Gõ mã hoặc tên học sinh, chọn từ gợi ý để thêm vào danh sách lớp.</p>
              </div>
              <span style={{ background: '#eff6ff', color: '#1f5aa6', padding: '8px 12px', borderRadius: '999px', fontWeight: 700 }}>
                {selectedStudents.length} học sinh đã thêm
              </span>
            </div>

            <div style={{ position: 'relative', marginBottom: '18px' }}>
              <label style={{ display: 'block', fontWeight: 700, color: '#334155' }}>
                Tìm học sinh
                <input
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Nhập mã học sinh hoặc họ tên"
                  style={{ ...inputStyle, paddingLeft: '16px' }}
                />
              </label>

              {studentSearch.trim() && (
                <div style={{ position: 'absolute', zIndex: 4, left: 0, right: 0, top: '82px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '10px', boxShadow: '0 14px 34px rgba(15,23,42,0.16)', overflow: 'hidden' }}>
                  {filteredStudents.map((student) => {
                    const selected = form.HocSinhIDs.includes(Number(student.HocSinhID));
                    const isCurrentClass = selectedClass?.LopID && Number(student.LopID) === Number(selectedClass.LopID);
                    return (
                      <button
                        key={student.HocSinhID}
                        type="button"
                        onClick={() => addStudent(student)}
                        disabled={selected}
                        style={{
                          width: '100%',
                          display: 'grid',
                          gridTemplateColumns: '1fr auto',
                          gap: '14px',
                          textAlign: 'left',
                          padding: '13px 15px',
                          border: 'none',
                          borderBottom: '1px solid #edf2f7',
                          background: selected ? '#f8fafc' : 'white',
                          cursor: selected ? 'default' : 'pointer',
                        }}
                      >
                        <span>
                          <strong style={{ color: '#1e293b' }}>{student.HocSinhID} - {student.TenHocSinh}</strong><br />
                          <small style={{ color: '#64748b' }}>{student.GioiTinh} - {student.DiaChi || 'Chưa có quê quán'}</small><br />
                          {student.TenLop && !isCurrentClass && (
                            <small style={{ color: '#b45309', fontWeight: 700 }}>Đã ở lớp {student.TenLop}</small>
                          )}
                          {isCurrentClass && (
                            <small style={{ color: '#16a34a', fontWeight: 700 }}>Đang ở lớp này</small>
                          )}
                        </span>
                        <span style={{ alignSelf: 'center', color: selected ? '#16a34a' : '#2563eb', fontWeight: 700 }}>
                          {selected ? 'Đã thêm' : 'Thêm'}
                        </span>
                      </button>
                    );
                  })}
                  {filteredStudents.length === 0 && <p style={{ padding: '14px', color: '#64748b', margin: 0 }}>Không tìm thấy học sinh phù hợp trong database.</p>}
                </div>
              )}
            </div>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 15px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <strong style={{ color: '#1a365d' }}>Danh sách học sinh sau khi thêm</strong>
                {selectedStudents.length > 0 && (
                  <button type="button" onClick={() => setForm((prev) => ({ ...prev, HocSinhIDs: [] }))} style={{ border: 'none', background: 'transparent', color: '#b91c1c', fontWeight: 700, cursor: 'pointer' }}>
                    Bỏ chọn tất cả
                  </button>
                )}
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={thStyle}>STT</th>
                    <th style={thStyle}>Mã</th>
                    <th style={thStyle}>Tên học sinh</th>
                    <th style={thStyle}>Giới tính</th>
                    <th style={thStyle}>Lớp hiện tại</th>
                    <th style={thStyle}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedStudents.map((student, index) => (
                    <tr key={student.HocSinhID}>
                      <td style={tdStyle}>{index + 1}</td>
                      <td style={tdStyle}>{student.HocSinhID}</td>
                      <td style={tdStyle}><strong>{student.TenHocSinh}</strong><br /><small>{student.DiaChi || '-'}</small></td>
                      <td style={tdStyle}>{student.GioiTinh}</td>
                      <td style={tdStyle}>{student.TenLop || (selectedClass?.LopID === student.LopID ? selectedClass.TenLop : 'Chưa có lớp')}</td>
                      <td style={tdStyle}>
                        <button type="button" onClick={() => removeStudent(student.HocSinhID)} style={{ border: 'none', background: '#fee2e2', color: '#b91c1c', borderRadius: '6px', padding: '7px 10px', fontWeight: 700, cursor: 'pointer' }}>
                          Bỏ chọn
                        </button>
                      </td>
                    </tr>
                  ))}
                  {selectedStudents.length === 0 && (
                    <tr>
                      <td style={{ ...tdStyle, color: '#64748b', textAlign: 'center' }} colSpan="6">Chưa thêm học sinh nào. Hãy nhập mã hoặc tên học sinh ở ô tìm kiếm phía trên.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 0' }}>
      {header}
      <section style={{ border: '1px solid #dbe3ef', borderRadius: '10px', overflow: 'hidden', background: 'white' }}>
        <div style={{ padding: '16px 18px', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, color: '#1a365d' }}>Danh sách lớp</h3>
          <span style={{ color: '#64748b' }}>{classes.length} lớp</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Lớp</th>
              <th style={thStyle}>Khối</th>
              <th style={thStyle}>Giáo viên chủ nhiệm</th>
              <th style={thStyle}>Số học sinh</th>
              <th style={thStyle}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((lop) => (
              <tr key={lop.LopID}>
                <td style={tdStyle}><strong>{lop.TenLop}</strong></td>
                <td style={tdStyle}>{lop.TenKhoi || lop.KhoiID}</td>
                <td style={tdStyle}>{lop.TenGiaoVien || 'Chưa phân công'}</td>
                <td style={tdStyle}>{lop.SoHocSinh}</td>
                <td style={tdStyle}>
                  <button type="button" onClick={() => openDetail(lop)} style={{ color: '#2b6cb0', fontWeight: 700, background: 'transparent', border: 'none', cursor: 'pointer' }}>
                    Xem chi tiết
                  </button>
                </td>
              </tr>
            ))}
            {classes.length === 0 && <tr><td style={tdStyle} colSpan="5">Chưa có lớp nào.</td></tr>}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px' }}>
      <div style={{ color: '#64748b', fontSize: '13px', marginBottom: '6px' }}>{label}</div>
      <strong style={{ color: '#1e293b' }}>{value || '-'}</strong>
    </div>
  );
}

function StudentTable({ students }) {
  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={thStyle}>STT</th>
            <th style={thStyle}>Tên</th>
            <th style={thStyle}>Ngày sinh</th>
            <th style={thStyle}>Giới tính</th>
            <th style={thStyle}>Quê quán</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => (
            <tr key={student.HocSinhID}>
              <td style={tdStyle}>{index + 1}</td>
              <td style={tdStyle}>{student.TenHocSinh}</td>
              <td style={tdStyle}>{formatDate(student.NgaySinh)}</td>
              <td style={tdStyle}>{student.GioiTinh}</td>
              <td style={tdStyle}>{student.DiaChi || '-'}</td>
            </tr>
          ))}
          {students.length === 0 && <tr><td style={tdStyle} colSpan="5">Danh sách học sinh trống.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
