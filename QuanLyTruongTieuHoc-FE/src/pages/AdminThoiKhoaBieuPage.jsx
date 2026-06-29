import { useEffect, useMemo, useState } from 'react';
import api from '../api/axiosClient';
import { useNotification } from '../components/NotificationProvider';

const selectStyle = {
  width: '100%',
  padding: '11px 12px',
  border: '1px solid #cbd5e1',
  borderRadius: '8px',
  background: 'white',
  fontSize: '15px',
  boxSizing: 'border-box',
};

const buttonPrimary = {
  padding: '12px 18px',
  border: 'none',
  borderRadius: '8px',
  background: '#1f5aa6',
  color: 'white',
  fontWeight: 700,
  cursor: 'pointer',
};

const thStyle = {
  padding: '12px',
  background: '#eef5ff',
  color: '#1a365d',
  border: '1px solid #dbe3ef',
  textAlign: 'center',
};

const tdStyle = {
  padding: '10px',
  border: '1px solid #e2e8f0',
  verticalAlign: 'middle',
};

function cellKey(thuId, tietHocId) {
  return `${thuId}-${tietHocId}`;
}

function shortLessonName(lesson) {
  return String(lesson.TenTiet || `Tiết ${lesson.TietHocID}`)
    .replace(/\s*[-–—]?\s*\(?\s*(sáng|chiều)\s*\)?\s*$/i, '')
    .trim();
}

function classOptionLabel(lop) {
  return `${lop.TenLop}${lop.TenGiaoVien ? ` - ${lop.TenGiaoVien}` : ' - Chưa phân công'}`;
}

export default function AdminThoiKhoaBieuPage() {
  const { showError, showSuccess } = useNotification();
  const [options, setOptions] = useState({ khoi: [], lop: [], thu: [], tietHoc: [], monHoc: [] });
  const [selectedKhoiId, setSelectedKhoiId] = useState('');
  const [selectedLopId, setSelectedLopId] = useState('');
  const [classInfo, setClassInfo] = useState(null);
  const [grid, setGrid] = useState({});
  const [loading, setLoading] = useState(false);

  const filteredClasses = useMemo(() => {
    if (!selectedKhoiId) return [];
    return options.lop.filter((lop) => Number(lop.KhoiID) === Number(selectedKhoiId));
  }, [options.lop, selectedKhoiId]);

  useEffect(() => {
    api.get('/thoi-khoa-bieu/options')
      .then((res) => {
        setOptions(res.data);
        const firstKhoi = res.data.khoi?.[0]?.KhoiID || '';
        const firstClass = res.data.lop?.find((lop) => Number(lop.KhoiID) === Number(firstKhoi));
        setSelectedKhoiId(firstKhoi);
        setSelectedLopId(firstClass?.LopID || '');
      })
      .catch((err) => {
        console.error('Lỗi tải dữ liệu thời khóa biểu', err);
        showError('Không tải được dữ liệu thời khóa biểu.');
      });
  }, []);

  const handleKhoiChange = (value) => {
    setSelectedKhoiId(value);
    const firstClass = options.lop.find((lop) => Number(lop.KhoiID) === Number(value));
    setSelectedLopId(firstClass?.LopID || '');
    setClassInfo(null);
    setGrid({});
  };

  // Auto-load timetable when class changes.
  useEffect(() => {
    if (selectedLopId) {
      viewTimetable(selectedLopId);
    }
  }, [selectedLopId]);

  const viewTimetable = async (lopId = selectedLopId) => {
    if (!lopId) {
      setClassInfo(null);
      setGrid({});
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`/thoi-khoa-bieu?lopId=${lopId}`);
      const nextGrid = {};
      res.data.entries.forEach((entry) => {
        nextGrid[cellKey(entry.ThuID, entry.TietHocID)] = entry.MonHocID ? String(entry.MonHocID) : '';
      });
      setClassInfo(res.data.lop);
      setGrid(nextGrid);
    } catch (err) {
      showError(err.response?.data?.message || 'Không xem được thời khóa biểu!');
    } finally {
      setLoading(false);
    }
  };

  const setSubject = (thuId, tietHocId, monHocId) => {
    setGrid((prev) => ({ ...prev, [cellKey(thuId, tietHocId)]: monHocId }));
  };

  const applyTimetable = async () => {
    if (!selectedLopId) return showError('Vui lòng chọn lớp!');
    if (!window.confirm('Bạn có chắc muốn áp dụng thay đổi thời khóa biểu này?')) return;

    const entries = [];
    options.thu.forEach((thu) => {
      options.tietHoc.forEach((tiet) => {
        entries.push({
          ThuID: thu.ThuID,
          TietHocID: tiet.TietHocID,
          MonHocID: grid[cellKey(thu.ThuID, tiet.TietHocID)] || null,
        });
      });
    });

    setLoading(true);
    try {
      const res = await api.put(`/thoi-khoa-bieu/${selectedLopId}`, { entries });
      const nextGrid = {};
      res.data.entries.forEach((entry) => {
        nextGrid[cellKey(entry.ThuID, entry.TietHocID)] = entry.MonHocID ? String(entry.MonHocID) : '';
      });
      setClassInfo(res.data.lop);
      setGrid(nextGrid);
      showSuccess('Cập nhật thời khóa biểu thành công!');
    } catch (err) {
      showError(err.response?.data?.message || 'Cập nhật thời khóa biểu thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px 0' }}>
      <div style={{ marginBottom: '22px' }}>
        <h2 style={{ color: '#1a365d', margin: 0 }}>Quản lý Thời khóa biểu</h2>
        <p style={{ color: '#64748b', marginTop: '8px' }}>Chọn khối và lớp, thời khóa biểu sẽ tự hiển thị để cập nhật môn học theo từng tiết.</p>
      </div>

      <section style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 280px) minmax(240px, 320px)', gap: '16px', alignItems: 'end', background: '#f8fafc', border: '1px solid #dbe3ef', borderRadius: '10px', padding: '18px', marginBottom: '22px', maxWidth: '720px' }}>
        <label style={{ fontWeight: 700, color: '#334155' }}>
          Khối lớp
          <select value={selectedKhoiId} onChange={(e) => handleKhoiChange(e.target.value)} style={{ ...selectStyle, marginTop: '7px' }}>
            <option value="">Chọn khối</option>
            {options.khoi.map((khoi) => <option key={khoi.KhoiID} value={khoi.KhoiID}>{khoi.TenKhoi}</option>)}
          </select>
        </label>

        <label style={{ fontWeight: 700, color: '#334155' }}>
          Lớp
          <select value={selectedLopId} onChange={(e) => { setSelectedLopId(e.target.value); setClassInfo(null); setGrid({}); }} style={{ ...selectStyle, marginTop: '7px' }}>
            <option value="">Chọn lớp</option>
            {filteredClasses.map((lop) => <option key={lop.LopID} value={lop.LopID}>{classOptionLabel(lop)}</option>)}
          </select>
        </label>
      </section>

      {classInfo && (
        <section style={{ border: '1px solid #dbe3ef', borderRadius: '10px', overflow: 'hidden', background: 'white' }}>
          <div style={{ padding: '16px 18px', background: '#eef5ff', display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'center' }}>
            <div>
              <h3 style={{ color: '#1a365d', margin: 0 }}>Thời khóa biểu lớp {classInfo.TenLop}</h3>
              <p style={{ color: '#64748b', margin: '6px 0 0' }}>{classInfo.TenKhoi} - Giáo viên chủ nhiệm: {classInfo.TenGiaoVien || 'Chưa phân công'}</p>
            </div>
            <button type="button" onClick={applyTimetable} disabled={loading} style={{ ...buttonPrimary, opacity: loading ? 0.65 : 1 }}>
              Áp dụng
            </button>
          </div>

          <div style={{ overflow: 'hidden', padding: '18px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, width: '64px' }}>Tiết</th>
                  {options.thu.map((thu) => <th key={thu.ThuID} style={thStyle}>{thu.TenThu}</th>)}
                </tr>
              </thead>
              <tbody>
                {options.tietHoc.map((tiet) => (
                  <tr key={tiet.TietHocID}>
                    <td style={{ ...tdStyle, padding: '8px 6px', fontWeight: 700, color: '#1a365d', background: '#f8fafc', textAlign: 'center', whiteSpace: 'nowrap' }}>{shortLessonName(tiet)}</td>
                    {options.thu.map((thu) => (
                      <td key={thu.ThuID} style={{ ...tdStyle, padding: '7px 6px' }}>
                        <select value={grid[cellKey(thu.ThuID, tiet.TietHocID)] || ''} onChange={(e) => setSubject(thu.ThuID, tiet.TietHocID, e.target.value)} style={{ ...selectStyle, padding: '9px 6px', fontSize: '13px' }}>
                          <option value="">Trống tiết</option>
                          {options.monHoc.map((mon) => <option key={mon.MonHocID} value={mon.MonHocID}>{mon.TenMonHoc}</option>)}
                        </select>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
